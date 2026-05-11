import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const subcategoryId = req.nextUrl.searchParams.get("subcategory_id");
  const search = req.nextUrl.searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      ...(subcategoryId ? { subcategory_id: subcategoryId } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      subcategory: {
        select: { id: true, name: true, category: { select: { id: true, name: true } } },
      },
      _count: { select: { supplier_products: true } },
    },
  });
  return ok(products);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { name, name_ar, description, unit, subcategory_id } = await req.json();
  if (!name || !name_ar || !unit || !subcategory_id) return err("name, name_ar, unit, subcategory_id required");

  const product = await prisma.product.create({
    data: { name, name_ar, description, unit, subcategory_id },
    include: {
      subcategory: { select: { id: true, name: true, category: { select: { id: true, name: true } } } },
    },
  });
  return ok(product, 201);
}
