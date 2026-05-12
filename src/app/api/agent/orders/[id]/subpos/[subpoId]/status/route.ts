import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

const VALID_TRANSITIONS: Record<string, string[]> = {
  sent: ["acknowledged"],
  acknowledged: ["dispatched"],
  dispatched: ["delivered"],
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; subpoId: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id: orderId, subpoId } = await params;

  const order = await prisma.order.findFirst({ where: { id: orderId, agent_id: agent.id } });
  if (!order) return err("Order not found", 404);

  const subpo = await prisma.subPO.findFirst({ where: { id: subpoId, order_id: orderId } });
  if (!subpo) return err("SubPO not found", 404);

  const { status: newStatus } = await req.json();
  const allowed = VALID_TRANSITIONS[subpo.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return err(`Cannot move from '${subpo.status}' to '${newStatus}'`, 400);
  }

  // Timestamp fields per status
  const timestampField: Record<string, object> = {
    acknowledged: { acknowledged_at: new Date() },
    dispatched: { dispatched_at: new Date() },
    delivered: { delivered_at: new Date() },
  };

  await prisma.subPO.update({
    where: { id: subpoId },
    data: { status: newStatus as never, ...timestampField[newStatus] },
  });

  // Auto-update order status based on SubPO states
  const allSubpos = await prisma.subPO.findMany({ where: { order_id: orderId } });
  const allDelivered = allSubpos.every((s) => s.status === "delivered");
  const someDelivered = allSubpos.some((s) => s.status === "delivered");

  const newOrderStatus = allDelivered
    ? "delivered"
    : someDelivered
    ? "partially_delivered"
    : "processing";

  await prisma.order.update({ where: { id: orderId }, data: { status: newOrderStatus as never } });

  // Signal to frontend when order just became fully delivered (prompt for QA survey)
  const survey_due = newOrderStatus === "delivered";

  return ok({ updated: true, order_status: newOrderStatus, survey_due });
}
