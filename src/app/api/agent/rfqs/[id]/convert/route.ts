import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { sendSubPOEmail } from "@/lib/email";
import { renderToBuffer } from "@react-pdf/renderer";
import { SubPODocument, type SubPODocumentProps } from "@/components/pdf/subpo-document";
import React from "react";
import type { JSXElementConstructor, ReactElement } from "react";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as unknown as { agent: { id: string; commission_rate: number } };
  const { id: rfqId } = await params;

  // Fetch RFQ with all line items + supplier info (server-side only — never returned to client)
  const rfq = await prisma.rFQ.findFirst({
    where: { id: rfqId, agent_id: agent.id, status: "sent" },
    include: {
      buyer: true,
      line_items: {
        include: {
          product: {
            include: { subcategory: { include: { category: true } } },
          },
          selected_supplier_product: {
            include: { supplier: true }, // supplier used server-side only
          },
        },
      },
    },
  });

  if (!rfq) return err("RFQ not found or not in 'sent' status", 404);
  if (rfq.line_items.length === 0) return err("RFQ has no line items", 400);
  if (rfq.line_items.some((li) => !li.selected_supplier_product)) {
    return err("All line items must have a supplier selection", 400);
  }

  // Calculate financials
  const total_amount = rfq.line_items.reduce(
    (s, li) => s + Number(li.buyer_unit_price ?? 0) * Number(li.quantity), 0
  );
  const cost_amount = rfq.line_items.reduce(
    (s, li) => s + Number(li.selected_unit_price ?? 0) * Number(li.quantity), 0
  );
  const margin_amount = total_amount - cost_amount;

  // Group line items by supplier (server-side grouping — supplier identity never leaves server)
  type LineItemWithSupplier = (typeof rfq.line_items)[number];
  const bySupplier: Record<string, LineItemWithSupplier[]> = {};
  for (const li of rfq.line_items) {
    const supplierId = li.selected_supplier_product!.supplier_id;
    if (!bySupplier[supplierId]) bySupplier[supplierId] = [];
    bySupplier[supplierId].push(li);
  }

  // Create Order + SubPOs + Commission atomically
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create order
    const newOrder = await tx.order.create({
      data: {
        rfq_id: rfq.id,
        buyer_id: rfq.buyer_id,
        agent_id: rfq.agent_id,
        status: "confirmed",
        total_amount,
        cost_amount,
        margin_amount,
        invoice_generated: false,
      },
    });

    // 2. Create SubPOs per supplier
    for (const supplierId of Object.keys(bySupplier)) {
      const items = bySupplier[supplierId];
      const supplierTotal = items.reduce(
        (s: number, li) => s + Number(li.selected_unit_price ?? 0) * Number(li.quantity), 0
      );
      await tx.subPO.create({
        data: {
          order_id: newOrder.id,
          supplier_id: supplierId,
          status: "sent",
          sent_at: new Date(),
          total_amount: supplierTotal,
          line_items: {
            create: items.map((li) => ({
              product_id: li.product_id,
              quantity: li.quantity,
              unit_price: li.selected_unit_price ?? 0,
            })),
          },
        },
      });
    }

    // 3. Create commission record
    const agentRecord = await tx.agent.findUnique({ where: { id: agent.id } });
    const commissionRate = Number(agentRecord?.commission_rate ?? 0);
    await tx.commission.create({
      data: {
        agent_id: agent.id,
        order_id: newOrder.id,
        margin_amount,
        commission_rate: commissionRate,
        commission_earned: (margin_amount * commissionRate) / 100,
        status: "pending",
      },
    });

    // 4. Mark RFQ as confirmed
    await tx.rFQ.update({ where: { id: rfqId }, data: { status: "confirmed" } });
    // Mark order invoice_generated flag
    await tx.order.update({ where: { id: newOrder.id }, data: { invoice_generated: true } });

    // 5. Auto-generate draft invoice for the buyer
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 30);
    await tx.invoice.create({
      data: {
        order_id: newOrder.id,
        buyer_id: rfq.buyer_id,
        amount: total_amount,
        status: "draft",
        due_at: dueAt,
      },
    });

    return newOrder;
  });

  // Send SubPO emails (outside transaction — non-fatal if it fails)
  const subpos = await prisma.subPO.findMany({
    where: { order_id: order.id },
    include: {
      supplier: true,
      line_items: { include: { product: true } },
    },
  });

  for (const subpo of subpos) {
    try {
      const subpoRef = `PO-${subpo.id.slice(0, 8).toUpperCase()}`;
      const orderRef = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
      const emailLines = subpo.line_items.map((li) => ({
        product_name: li.product.name,
        quantity: Number(li.quantity),
        unit: li.product.unit,
        unit_price: Number(li.unit_price),
        currency: "USD",
        line_total: Number(li.unit_price) * Number(li.quantity),
      }));

      // Render SubPO PDF server-side — if this fails, send email without attachment
      let pdfAttachment: Buffer | undefined;
      try {
        const pdfProps: SubPODocumentProps = {
          subpoId: subpo.id,
          orderId: order.id,
          createdAt: subpo.created_at.toISOString(),
          supplier: {
            name: subpo.supplier.name,
            email: subpo.supplier.email,
            country: subpo.supplier.country,
          },
          deliveryAddress: rfq.buyer.address,
          lines: emailLines.map((l, i) => ({ number: i + 1, ...l, product_unit: l.unit })),
          notes: rfq.notes,
        };
        const element = React.createElement(
          SubPODocument, pdfProps
        ) as ReactElement<SubPODocumentProps, JSXElementConstructor<SubPODocumentProps>>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfAttachment = await renderToBuffer(element as any);
      } catch (pdfErr) {
        console.warn(`PDF rendering failed for SubPO ${subpo.id} — sending email without attachment:`, pdfErr);
      }

      await sendSubPOEmail({
        supplierEmail: subpo.supplier.email,
        supplierName: subpo.supplier.name,
        subpoRef,
        orderRef,
        lines: emailLines,
        total: Number(subpo.total_amount),
        currency: "USD",
        deliveryAddress: rfq.buyer.address,
        notes: rfq.notes,
        pdfAttachment,
      });
    } catch (e) {
      console.error(`Failed to send SubPO email for ${subpo.id}:`, e);
    }
  }

  return ok({ order_id: order.id }, 201);
}
