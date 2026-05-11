import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { supplier_products: true } } },
  });
  return ok(suppliers);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { name, email, phone, country } = await req.json();
  if (!name || !email || !country) return err("name, email, country required");

  const supplier = await prisma.supplier.create({ data: { name, email, phone, country } });
  return ok(supplier, 201);
}
