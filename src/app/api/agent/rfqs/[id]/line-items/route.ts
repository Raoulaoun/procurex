import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { applyMargin } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id: rfqId } = await params;

  const rfq = await prisma.rFQ.findFirst({ where: { id: rfqId, agent_id: agent.id, status: "draft" } });
  if (!rfq) return err("RFQ not found or not editable", 404);

  const { product_id, quantity, selected_supplier_product_id } = await req.json();
  if (!product_id || !quantity) return err("product_id and quantity required");

  // Resolve margin and buyer price if a supplier product is selected
  let margin_pct: number | undefined;
  let selected_unit_price: number | undefined;
  let buyer_unit_price: number | undefined;

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

  const item = await prisma.rFQLineItem.create({
    data: {
      rfq_id: rfqId, product_id, quantity,
      selected_supplier_product_id: selected_supplier_product_id ?? null,
      selected_unit_price: selected_unit_price ?? null,
      margin_pct: margin_pct ?? null,
      buyer_unit_price: buyer_unit_price ?? null,
    },
    include: { product: { select: { id: true, name: true, unit: true } } },
  });
  return ok(item, 201);
}
