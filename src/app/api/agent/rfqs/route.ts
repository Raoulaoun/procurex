import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as Awaited<ReturnType<typeof requireAgent>> & { agent: NonNullable<unknown> };

  const rfqs = await prisma.rFQ.findMany({
    where: { agent_id: (agent as { id: string }).id },
    orderBy: { created_at: "desc" },
    include: {
      buyer: { select: { id: true, name: true, company: true } },
      _count: { select: { line_items: true } },
    },
  });
  return ok(rfqs);
}

export async function POST(req: NextRequest) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const { buyer_id, notes } = await req.json();
  if (!buyer_id) return err("buyer_id required");

  // Verify buyer belongs to this agent
  const buyer = await prisma.buyer.findFirst({ where: { id: buyer_id, assigned_agent_id: agent.id } });
  if (!buyer) return err("Buyer not found", 404);

  const rfq = await prisma.rFQ.create({
    data: { agent_id: agent.id, buyer_id, notes, status: "draft" },
    include: { buyer: { select: { id: true, name: true, company: true } } },
  });
  return ok(rfq, 201);
}
