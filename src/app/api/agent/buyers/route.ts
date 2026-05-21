import { ok } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent-auth";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const buyers = await prisma.buyer.findMany({
    where: { assigned_agent_id: agent.id },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, company: true, email: true, phone: true, address: true, created_at: true,
      _count: { select: { rfqs: true, orders: true } },
    },
  });
  return ok(buyers);
}
