import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { applyMargin } from "@/lib/utils";

// Returns up to 3 ranked supplier options for a product — NO supplier identity exposed
export async function GET(req: NextRequest) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;

  const productId = req.nextUrl.searchParams.get("product_id");
  const categoryId = req.nextUrl.searchParams.get("category_id");
  const quantity = Number(req.nextUrl.searchParams.get("quantity") ?? 1);

  if (!productId || !categoryId) return err("product_id and category_id required");

  const [supplierProducts, category] = await Promise.all([
    prisma.supplierProduct.findMany({
      where: {
        product_id: productId,
        stock_status: { not: "out" },
        supplier: { status: "active" },
        moq: { lte: quantity }, // only options that meet MOQ
      },
      include: {
        supplier: { select: { quality_score: true } }, // quality_score only — never name/id
      },
    }),
    prisma.category.findUnique({ where: { id: categoryId }, select: { margin_pct: true } }),
  ]);

  if (!category) return err("Category not found", 404);
  const marginPct = Number(category.margin_pct);

  if (supplierProducts.length === 0) {
    return ok({ options: [], message: "No available suppliers for this product at the requested quantity." });
  }

  // Rank by combined price + quality score
  const prices = supplierProducts.map((sp) => Number(sp.unit_price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const ranked = supplierProducts
    .map((sp) => {
      const priceScore = priceRange === 0 ? 1 : 1 - (Number(sp.unit_price) - minPrice) / priceRange;
      const qualityScore = Number(sp.supplier.quality_score) / 10;
      return { sp, score: priceScore * 0.6 + qualityScore * 0.4 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const options = ranked.map(({ sp }, i) => ({
    rank: i + 1,
    supplier_product_id: sp.id,
    buyer_unit_price: Number((applyMargin(Number(sp.unit_price), marginPct)).toFixed(2)),
    currency: sp.currency,
    lead_time_days: sp.lead_time_days,
    moq: sp.moq,
    quality_tier: sp.quality_tier,
    stock_status: sp.stock_status,
    line_total: Number((applyMargin(Number(sp.unit_price), marginPct) * quantity).toFixed(2)),
    // supplier_id and supplier.name intentionally omitted
  }));

  return ok({ options });
}
