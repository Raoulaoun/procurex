import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { applyMargin } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id: rfqId, itemId } = await params;

  const rfq = await prisma.rFQ.findFirst({ where: { id: rfqId, agent_id: agent.id, status: "draft" } });
  if (!rfq) return err("RFQ not found or not editable", 404);

  const { quantity, selected_supplier_product_id } = await req.json();

  let margin_pct: number | null = null;
  let selected_unit_price: number | null = null;
  let buyer_unit_price: number | null = null;

  if (selected_supplier_product_id) {
    const sp = await prisma.supplierProduct.findUnique({
      where: { id: selected_supplier_product_id },
      include: { product: { include: { subcategory: { include: { category: true } } } } },
    });
    if (sp) {
      margin_pct = Number(sp.product.subcategory.category.margin_pct);
      selected_unit_price = Number(sp.unit_price);
      buyer_unit_price = applyMargin(selected_unit_price, margin_pct);
    }
  }

  const item = await prisma.rFQLineItem.update({
    where: { id: itemId },
    data: { quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price },
  });
  return ok(item);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id: rfqId, itemId } = await params;

  const rfq = await prisma.rFQ.findFirst({ where: { id: rfqId, agent_id: agent.id, status: "draft" } });
  if (!rfq) return err("RFQ not found or not editable", 404);

  await prisma.rFQLineItem.delete({ where: { id: itemId } });
  return ok({ deleted: true });
}
