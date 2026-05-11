import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return err("Not found", 404);
  return ok(category);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await req.json();
  const { name, name_ar, margin_pct } = body;

  const category = await prisma.category.update({
    where: { id },
    data: { name, name_ar, margin_pct },
  });
  return ok(category);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return ok({ deleted: true });
}
