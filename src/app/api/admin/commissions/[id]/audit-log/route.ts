import { NextRequest } from "next/server";
import { requireAdmin, ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET: Audit log for a single commission, newest entry first.
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return err("Commission not found", 404);

  const logs = await prisma.commissionAuditLog.findMany({
    where: { commission_id: id },
    orderBy: { performed_at: "desc" },
    include: {
      admin: { select: { email: true } },
    },
  });

  return ok(logs);
}
