import { NextRequest } from "next/server";
import { requireAdmin, ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// POST: Mark a single pending commission as paid.
// Business rules:
//   - Only pending commissions can be marked paid.
//   - agent.total_earned is incremented atomically (no read-then-write).
//   - An audit log entry is created in the same transaction.
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const adminId = (auth as { user: { id: string } }).user.id;
  const { id } = await params;

  const result = await prisma.$transaction(async (tx) => {
    const commission = await tx.commission.findUnique({ where: { id } });
    if (!commission) return null;
    if (commission.status !== "pending") return { _err: "Only pending commissions can be marked paid." };

    const updated = await tx.commission.update({
      where: { id },
      data: { status: "paid", paid_at: new Date() },
    });

    const agent = await tx.agent.update({
      where: { id: commission.agent_id },
      data: { total_earned: { increment: commission.commission_earned } },
      select: { total_earned: true },
    });

    await tx.commissionAuditLog.create({
      data: {
        commission_id: id,
        action: "paid",
        performed_by_admin_id: adminId,
        amount_at_action: commission.commission_earned,
      },
    });

    return { commission: updated, agent_total_earned: agent.total_earned };
  });

  if (result === null) return err("Commission not found", 404);
  if ("_err" in result) return err(result._err as string, 400);
  return ok(result);
}
