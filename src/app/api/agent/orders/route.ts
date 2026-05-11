import { ok } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const orders = await prisma.order.findMany({
    where: { agent_id: agent.id },
    orderBy: { created_at: "desc" },
    include: {
      buyer: { select: { id: true, name: true, company: true } },
      _count: { select: { subpos: true } },
    },
  });

  return ok(orders);
}
