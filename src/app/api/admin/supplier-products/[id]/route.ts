import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  const { unit_price, currency, lead_time_days, moq, quality_tier, stock_status } = await req.json();

  const sp = await prisma.supplierProduct.update({
    where: { id },
    data: { unit_price, currency, lead_time_days, moq, quality_tier, stock_status, last_updated: new Date() },
  });
  return ok(sp);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  await prisma.supplierProduct.delete({ where: { id } });
  return ok({ deleted: true });
}
