import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

// GET: Order detail including per-SubPO survey status.
// survey_id on each SubPO is non-null when a survey has been submitted for that shipment.
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
          // Supplier details visible to agent on order/delivery view (not the same as
          // quotation-options where supplier identity is always hidden)
          supplier: { select: { id: true, name: true, email: true, country: true } },
          line_items: {
            include: { product: { select: { id: true, name: true, unit: true } } },
          },
          survey: { select: { id: true } }, // per-SubPO survey status
        },
        orderBy: { created_at: "asc" },
      },
      commission: { select: { commission_earned: true, commission_rate: true, status: true } },
    },
  });

  if (!order) return err("Order not found", 404);

  // Attach survey_id per SubPO for the UI to determine which "Rate" buttons to show
  const subposWithSurvey = order.subpos.map((sp) => ({
    ...sp,
    survey_id: sp.survey?.id ?? null,
  }));

  return ok({ ...order, subpos: subposWithSurvey });
}
