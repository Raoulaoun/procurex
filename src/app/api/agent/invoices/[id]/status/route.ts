import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["sent"],
  sent: ["paid"],
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const { status: newStatus } = await req.json();

  const invoice = await prisma.invoice.findFirst({
    where: { id, order: { agent_id: agent.id } },
  });

  if (!invoice) return err("Invoice not found", 404);

  const allowed = VALID_TRANSITIONS[invoice.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return err(`Cannot transition from '${invoice.status}' to '${newStatus}'`, 400);
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: newStatus },
  });

  return ok(updated);
}
