import { NextRequest, NextResponse } from "next/server";
import { err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument, type InvoiceDocumentProps } from "@/components/pdf/invoice-document";
import React from "react";
import type { JSXElementConstructor, ReactElement } from "react";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, order: { agent_id: agent.id } },
    include: {
      buyer: true,
      order: {
        include: {
          rfq: { select: { id: true, notes: true } },
        },
      },
    },
  });

  if (!invoice) return err("Invoice not found", 404);

  const rfqLineItems = await prisma.rFQLineItem.findMany({
    where: { rfq_id: invoice.order.rfq.id },
    include: { product: { select: { name: true, unit: true } } },
  });

  const lines = rfqLineItems.map((li, i) => ({
    number: i + 1,
    product_name: li.product.name,
    product_unit: li.product.unit,
    quantity: Number(li.quantity),
    unit_price: Number(li.buyer_unit_price ?? 0),
    currency: "USD",
    line_total: Number(li.buyer_unit_price ?? 0) * Number(li.quantity),
  }));

  const props: InvoiceDocumentProps = {
    invoiceId: invoice.id,
    orderId: invoice.order_id,
    issuedAt: invoice.issued_at.toISOString(),
    dueAt: invoice.due_at.toISOString(),
    status: invoice.status,
    buyer: {
      name: invoice.buyer.name,
      company: invoice.buyer.company,
      email: invoice.buyer.email,
      address: invoice.buyer.address,
    },
    lines,
    notes: invoice.order.rfq.notes,
    currency: "USD",
  };

  const element = React.createElement(
    InvoiceDocument,
    props
  ) as ReactElement<InvoiceDocumentProps, JSXElementConstructor<InvoiceDocumentProps>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  const refNo = `INV-${invoice.id.slice(0, 8).toUpperCase()}`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${refNo}.pdf"`,
    },
  });
}
