import { NextRequest } from "next/server";
import { requireAdmin, ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// POST: Reverse a paid commission back to pending.
// Business rules:
//   - Only paid commissions can be reversed.
//   - Reason is required (min 5 chars) — enforced at API layer.
//   - agent.total_earned is decremented atomically. If this would go negative,
//     the operation still proceeds (audit trail matters more than preventing negative state).
//   - An audit log entry with the reversal reason is created in the same transaction.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const adminId = (auth as { user: { id: string } }).user.id;
  const { id } = await params;

  const body = await req.json();
  const { reason } = body ?? {};
  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    return err("reason is required and must be at least 5 characters", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const commission = await tx.commission.findUnique({ where: { id } });
    if (!commission) return null;
    if (commission.status !== "paid") return { _err: "Only paid commissions can be reversed." };

    const updated = await tx.commission.update({
      where: { id },
      data: { status: "pending", paid_at: null },
    });

    const agent = await tx.agent.update({
      where: { id: commission.agent_id },
      data: { total_earned: { decrement: commission.commission_earned } },
      select: { total_earned: true },
    });

    await tx.commissionAuditLog.create({
      data: {
        commission_id: id,
        action: "reversed",
        reason: reason.trim(),
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
