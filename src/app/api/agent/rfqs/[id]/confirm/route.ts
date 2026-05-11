import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

// Mark the RFQ as "sent" (quote sent to buyer, ready to become order on buyer confirmation)
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const rfq = await prisma.rFQ.findFirst({
    where: { id, agent_id: agent.id, status: "draft" },
    include: { line_items: true },
  });

  if (!rfq) return err("RFQ not found or already sent", 404);
  if (rfq.line_items.length === 0) return err("Cannot confirm an empty RFQ", 400);

  const unselected = rfq.line_items.filter((li) => !li.selected_supplier_product_id);
  if (unselected.length > 0) return err(`${unselected.length} line item(s) have no option selected`, 400);

  const updated = await prisma.rFQ.update({
    where: { id },
    data: { status: "sent" },
  });

  return ok(updated);
}
