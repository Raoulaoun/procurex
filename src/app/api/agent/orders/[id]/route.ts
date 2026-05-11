import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, agent_id: agent.id },
    include: {
      buyer: true,
      rfq: { select: { id: true, notes: true } },
      subpos: {
        include: {
          // Return supplier name for SubPO display (agent sees PO details, not who supplied the quote)
          supplier: { select: { id: true, name: true, email: true, country: true } },
          line_items: {
            include: { product: { select: { id: true, name: true, unit: true } } },
          },
        },
        orderBy: { created_at: "asc" },
      },
      commission: { select: { commission_earned: true, commission_rate: true, status: true } },
    },
  });

  if (!order) return err("Order not found", 404);
  return ok(order);
}
