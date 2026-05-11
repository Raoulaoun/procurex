import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      supplier_products: {
        include: { product: { include: { subcategory: { include: { category: true } } } } },
        orderBy: { product: { name: "asc" } },
      },
    },
  });
  if (!supplier) return err("Not found", 404);
  return ok(supplier);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  const { name, email, phone, country, status } = await req.json();

  const supplier = await prisma.supplier.update({
    where: { id },
    data: { name, email, phone, country, status },
  });
  return ok(supplier);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  await prisma.supplier.delete({ where: { id } });
  return ok({ deleted: true });
}
