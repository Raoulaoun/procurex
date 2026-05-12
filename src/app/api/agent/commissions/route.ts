import { ok } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const commissions = await prisma.commission.findMany({
    where: { agent_id: agent.id },
    orderBy: { created_at: "desc" },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          created_at: true,
          buyer: { select: { name: true, company: true } },
        },
      },
    },
  });

  // Aggregate totals
  const total_earned = commissions.reduce((s, c) => s + Number(c.commission_earned), 0);
  const total_pending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.commission_earned), 0);
  const total_paid = commissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.commission_earned), 0);

  return ok({ commissions, totals: { total_earned, total_pending, total_paid } });
}
