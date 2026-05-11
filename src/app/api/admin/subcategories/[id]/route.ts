import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  const { name, name_ar, category_id } = await req.json();
  const sub = await prisma.subcategory.update({
    where: { id },
    data: { name, name_ar, category_id },
    include: { category: { select: { id: true, name: true } } },
  });
  return ok(sub);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  await prisma.subcategory.delete({ where: { id } });
  return ok({ deleted: true });
}
