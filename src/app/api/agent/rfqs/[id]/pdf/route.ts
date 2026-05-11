import { NextRequest, NextResponse } from "next/server";
import { err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuoteDocument, type QuoteDocumentProps } from "@/components/pdf/quote-document";
import React from "react";
import type { JSXElementConstructor, ReactElement } from "react";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string; full_name: string; email: string } };
  const { id } = await params;

  const rfq = await prisma.rFQ.findFirst({
    where: { id, agent_id: agent.id },
    include: {
      buyer: true,
      line_items: {
        include: {
          product: { select: { name: true, unit: true } },
          selected_supplier_product: {
            select: { quality_tier: true, currency: true },
          },
        },
      },
    },
  });

  if (!rfq) return err("RFQ not found", 404);
  if (rfq.line_items.some((li) => !li.selected_supplier_product_id)) {
    return err("All line items must have a selection before generating a quote", 400);
  }

  const lines = rfq.line_items.map((li, i) => ({
    number: i + 1,
    product_name: li.product.name,
    product_unit: li.product.unit,
    quantity: Number(li.quantity),
    buyer_unit_price: Number(li.buyer_unit_price ?? 0),
    currency: li.selected_supplier_product?.currency ?? "USD",
    quality_tier: li.selected_supplier_product?.quality_tier ?? "tier_2",
    line_total: Number(li.buyer_unit_price ?? 0) * Number(li.quantity),
  }));

  const agentProfile = await prisma.agent.findUnique({
    where: { id: agent.id },
    select: { full_name: true, email: true },
  });

  const props: QuoteDocumentProps = {
    rfqId: rfq.id,
    createdAt: rfq.created_at.toISOString(),
    buyer: {
      name: rfq.buyer.name,
      company: rfq.buyer.company,
      email: rfq.buyer.email,
      address: rfq.buyer.address,
    },
    agent: {
      full_name: agentProfile?.full_name ?? "ProcureX Agent",
      email: agentProfile?.email ?? "",
    },
    lines,
    notes: rfq.notes,
  };

  const element = React.createElement(
    QuoteDocument,
    props
  ) as ReactElement<QuoteDocumentProps, JSXElementConstructor<QuoteDocumentProps>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  const refNo = `QUO-${rfq.id.slice(0, 8).toUpperCase()}`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${refNo}.pdf"`,
    },
  });
}
