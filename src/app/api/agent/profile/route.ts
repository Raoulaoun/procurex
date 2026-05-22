import { requireAgent } from "@/lib/agent-auth";
import { ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;

  const agent = await prisma.agent.findUnique({
    where: { id: auth.agent.id },
    select: {
      id: true,
      full_name: true,
      email: true,
      commission_rate: true,
      total_earned: true,
      status: true,
    },
  });

  if (!agent) return err("Agent not found", 404);

  return ok({
    id: agent.id,
    full_name: agent.full_name,
    email: agent.email,
    commission_rate: Number(agent.commission_rate),
    total_earned: Number(agent.total_earned),
    status: agent.status,
  });
}
