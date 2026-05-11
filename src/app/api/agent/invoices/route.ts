import { ok } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const invoices = await prisma.invoice.findMany({
    where: { order: { agent_id: agent.id } },
    orderBy: { issued_at: "desc" },
    include: {
      buyer: { select: { id: true, name: true, company: true } },
      order: { select: { id: true } },
    },
  });

  return ok(invoices);
}
