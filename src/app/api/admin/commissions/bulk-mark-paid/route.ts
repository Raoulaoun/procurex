import { NextRequest } from "next/server";
import { requireAdmin, ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// POST: Bulk mark multiple pending commissions as paid in one transaction.
// Business rules:
//   - Max 100 IDs per request to bound transaction size.
//   - Non-pending or not-found commissions are skipped (not errors) — reported in response.
//   - Per-agent total_earned increments are aggregated and applied once per agent
//     to avoid row-lock contention on the agent row.
//   - One audit log row per successfully paid commission.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const adminId = (auth as { user: { id: string } }).user.id;

  const body = await req.json();
  const { commission_ids } = body ?? {};

  if (!Array.isArray(commission_ids) || commission_ids.length === 0) {
    return err("commission_ids must be a non-empty array", 400);
  }
  if (commission_ids.length > 100) {
    return err("Cannot process more than 100 commissions at once", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const commissions = await tx.commission.findMany({
      where: { id: { in: commission_ids } },
    });

    const commissionMap = new Map(commissions.map((c) => [c.id, c]));
    const paid: string[] = [];
    const skipped: { id: string; reason: string }[] = [];
    // Per-agent accumulated earned amounts — avoid multiple increments on same agent row
    const agentIncrements = new Map<string, number>();
    let total_paid_amount = 0;

    const now = new Date();

    for (const id of commission_ids) {
      const commission = commissionMap.get(id);
      if (!commission) { skipped.push({ id, reason: "Not found" }); continue; }
      if (commission.status !== "pending") { skipped.push({ id, reason: `Status is '${commission.status}', not pending` }); continue; }

      await tx.commission.update({
        where: { id },
        data: { status: "paid", paid_at: now },
      });

      await tx.commissionAuditLog.create({
        data: {
          commission_id: id,
          action: "bulk_paid",
          performed_by_admin_id: adminId,
          amount_at_action: commission.commission_earned,
        },
      });

      const earned = Number(commission.commission_earned);
      agentIncrements.set(commission.agent_id, (agentIncrements.get(commission.agent_id) ?? 0) + earned);
      total_paid_amount += earned;
      paid.push(id);
    }

    // One update per agent — avoids repeated row locks
    for (const [agentId, amount] of Array.from(agentIncrements.entries())) {
      await tx.agent.update({
        where: { id: agentId },
        data: { total_earned: { increment: amount } },
      });
    }

    return { paid, skipped, total_paid_amount: parseFloat(total_paid_amount.toFixed(2)) };
  });

  return ok(result);
}
