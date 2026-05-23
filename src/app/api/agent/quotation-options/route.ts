import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";
import { applyMargin } from "@/lib/utils";

// GET: Returns up to 3 ranked supplier options for a product.
// Business rules:
//   - Supplier identity (id, name) is NEVER included in the response.
//   - Only active suppliers with non-out stock are considered.
//   - Only options whose MOQ <= requested quantity are shown (agent can't
//     order below the minimum).
//   - If MOQ filtering leaves zero results but suppliers DO exist for the
//     product (they just require a higher quantity), a structured empty
//     response is returned with the minimum available MOQ so the agent can
//     adjust their quantity rather than wondering why nothing shows up.
export async function GET(req: NextRequest) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;

  const productId = req.nextUrl.searchParams.get("product_id");
  const categoryId = req.nextUrl.searchParams.get("category_id");
  const quantity = Number(req.nextUrl.searchParams.get("quantity") ?? 1);

  if (!productId || !categoryId) return err("product_id and category_id required");

  const baseWhere = {
    product_id: productId,
    stock_status: { not: "out" as const },
    supplier: { status: "active" as const },
  };

  const [supplierProducts, category] = await Promise.all([
    prisma.supplierProduct.findMany({
      where: { ...baseWhere, moq: { lte: quantity } },
      include: {
        supplier: { select: { quality_score: true } }, // quality_score only — never name/id
      },
    }),
    prisma.category.findUnique({ where: { id: categoryId }, select: { margin_pct: true } }),
  ]);

  if (!category) return err("Category not found", 404);
  const marginPct = Number(category.margin_pct);

  // 1.3 — MOQ empty-state: if no results due to quantity being below MOQ,
  // run a second query without the MOQ filter to find the minimum available MOQ,
  // then return a structured response so the UI can show a helpful message.
  if (supplierProducts.length === 0) {
    const anyAvailable = await prisma.supplierProduct.findMany({
      where: baseWhere,
      select: { moq: true },
      orderBy: { moq: "asc" },
    });

    if (anyAvailable.length > 0) {
      const minMoq = anyAvailable[0].moq;
      return ok({
        options: [],
        moq_required: true,
        min_available_moq: minMoq,
        message: `Minimum order quantity for this product is ${minMoq} units. Increase your quantity to see pricing options.`,
      });
    }

    return ok({ options: [], message: "No available suppliers for this product at the requested quantity." });
  }

  // Rank by combined price + quality score (60/40 split)
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
    // supplier_id and supplier.name intentionally omitted — never expose to agent
  }));

  return ok({ options });
}
