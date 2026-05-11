import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { subcategories: true } } },
  });
  return ok(categories);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json();
  const { name, name_ar, margin_pct } = body;

  if (!name || !name_ar) return err("name and name_ar are required");

  const category = await prisma.category.create({
    data: { name, name_ar, margin_pct: margin_pct ?? 10 },
  });
  return ok(category, 201);
}
