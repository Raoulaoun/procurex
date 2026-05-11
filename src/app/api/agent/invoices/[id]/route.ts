import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

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
          subpos: {
            include: {
              line_items: {
                include: { product: { select: { name: true, unit: true } } },
              },
            },
          },
          commission: {
            select: { commission_earned: true, commission_rate: true, status: true },
          },
        },
      },
    },
  });

  if (!invoice) return err("Invoice not found", 404);

  // Build line items from subpo line items (buyer-facing: use subpo line items aggregated)
  // We need buyer_unit_price, not cost. Fetch from RFQ line items.
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

  return ok({ ...invoice, lines });
}
