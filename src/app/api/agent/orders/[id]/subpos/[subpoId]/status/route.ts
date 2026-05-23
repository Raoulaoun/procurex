import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

const VALID_TRANSITIONS: Record<string, string[]> = {
  sent: ["acknowledged"],
  acknowledged: ["dispatched"],
  dispatched: ["delivered"],
};

// PUT: Advance a SubPO's status along the delivery pipeline.
// Business rules:
//   - Only the owning agent may update SubPO status.
//   - Status must follow VALID_TRANSITIONS (no skipping steps).
//   - When the last SubPO on an order becomes delivered, the order moves to
//     `delivered` and any draft invoice for that order is automatically
//     progressed to `sent` with issued_at stamped to now.
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

  const timestampField: Record<string, object> = {
    acknowledged: { acknowledged_at: new Date() },
    dispatched: { dispatched_at: new Date() },
    delivered: { delivered_at: new Date() },
  };

  // Run SubPO update, order status recalculation, and optional invoice
  // progression all inside a single transaction for atomicity.
  const result = await prisma.$transaction(async (tx) => {
    await tx.subPO.update({
      where: { id: subpoId },
      data: { status: newStatus as never, ...timestampField[newStatus] },
    });

    const allSubpos = await tx.subPO.findMany({ where: { order_id: orderId } });
    const allDelivered = allSubpos.every((s) => s.status === "delivered");
    const someDelivered = allSubpos.some((s) => s.status === "delivered");

    const newOrderStatus = allDelivered ? "delivered" : someDelivered ? "partially_delivered" : "processing";

    await tx.order.update({ where: { id: orderId }, data: { status: newOrderStatus as never } });

    // 1.2 — When the full order becomes delivered, auto-progress any draft invoice
    // to `sent` so the buyer immediately receives a billable invoice.
    let invoice_progressed = false;
    if (newOrderStatus === "delivered") {
      const invoiceUpdate = await tx.invoice.updateMany({
        where: { order_id: orderId, status: "draft" },
        data: { status: "sent", issued_at: new Date() },
      });
      invoice_progressed = invoiceUpdate.count > 0;
    }

    return { order_status: newOrderStatus, invoice_progressed };
  });

  // survey_due signals the UI to show per-SubPO "Rate Supplier" buttons
  const survey_due = newStatus === "delivered";

  return ok({ updated: true, ...result, survey_due });
}
