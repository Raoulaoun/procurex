import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const rfq = await prisma.rFQ.findFirst({
    where: { id, agent_id: agent.id },
    include: {
      buyer: true,
      line_items: {
        include: {
          product: {
            include: { subcategory: { include: { category: true } } },
          },
          // selected_supplier_product included but supplier fields excluded at query level
          selected_supplier_product: {
            select: {
              id: true, quality_tier: true, currency: true,
              lead_time_days: true, moq: true, stock_status: true,
              // supplier_id intentionally omitted
            },
          },
        },
      },
    },
  });

  if (!rfq) return err("RFQ not found", 404);
  return ok(rfq);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const rfq = await prisma.rFQ.findFirst({ where: { id, agent_id: agent.id, status: "draft" } });
  if (!rfq) return err("RFQ not found or cannot be deleted", 404);

  await prisma.rFQ.delete({ where: { id } });
  return ok({ deleted: true });
}
