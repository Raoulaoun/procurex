import { NextRequest } from "next/server";
import { ok } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;

  const subcategoryId = req.nextUrl.searchParams.get("subcategory_id");
  const search = req.nextUrl.searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      ...(subcategoryId ? { subcategory_id: subcategoryId } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { name_ar: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      // Only show products that have at least one active supplier
      supplier_products: {
        some: { stock_status: { not: "out" }, supplier: { status: "active" } },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, name_ar: true, unit: true, description: true,
      subcategory: { select: { id: true, name: true, category_id: true } },
    },
  });
  return ok(products);
}
