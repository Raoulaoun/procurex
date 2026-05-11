import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const categoryId = req.nextUrl.searchParams.get("category_id");

  const subcategories = await prisma.subcategory.findMany({
    where: categoryId ? { category_id: categoryId } : undefined,
    orderBy: { name: "asc" },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });
  return ok(subcategories);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { name, name_ar, category_id } = await req.json();
  if (!name || !name_ar || !category_id) return err("name, name_ar, category_id required");

  const sub = await prisma.subcategory.create({
    data: { name, name_ar, category_id },
    include: { category: { select: { id: true, name: true } } },
  });
  return ok(sub, 201);
}
