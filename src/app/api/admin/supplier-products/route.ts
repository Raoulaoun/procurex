import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status } = await req.json();
  if (!supplier_id || !product_id || unit_price == null || !lead_time_days || !quality_tier) {
    return err("supplier_id, product_id, unit_price, lead_time_days, quality_tier required");
  }

  const sp = await prisma.supplierProduct.upsert({
    where: { supplier_id_product_id: { supplier_id, product_id } },
    create: { supplier_id, product_id, unit_price, currency: currency ?? "USD", lead_time_days, moq: moq ?? 1, quality_tier, stock_status: stock_status ?? "ok" },
    update: { unit_price, currency, lead_time_days, moq, quality_tier, stock_status },
    include: { product: { select: { id: true, name: true, unit: true } } },
  });
  return ok(sp, 201);
}
