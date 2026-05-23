import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

// GET: List all SubPO surveys submitted by this agent's orders
export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const surveys = await prisma.subPOSurvey.findMany({
    where: { subpo: { order: { agent_id: agent.id } } },
    orderBy: { submitted_at: "desc" },
    include: {
      subpo: {
        select: {
          id: true,
          order: { select: { id: true } },
          supplier: { select: { name: true, country: true } },
        },
      },
      buyer: { select: { name: true, company: true } },
    },
  });

  return ok(surveys);
}

// POST: Submit a QA survey for a specific delivered SubPO
// Business rules:
//   - subpo_id must belong to an order owned by this agent
//   - SubPO must be in `delivered` status
//   - Only one survey per SubPO (enforced by DB unique constraint + check below)
//   - Rolling quality_score on Supplier is recomputed using only surveys for
//     that supplier's SubPOs — no cross-supplier contamination
export async function POST(req: NextRequest) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const body = await req.json();
  const { subpo_id, delivery_score, quality_score, accuracy_score, packaging_score, comments } = body;

  if (!subpo_id) return err("subpo_id is required", 400);

  const scores = [delivery_score, quality_score, accuracy_score, packaging_score];
  if (scores.some((s) => typeof s !== "number" || !Number.isInteger(s) || s < 1 || s > 5)) {
    return err("All scores must be integers between 1 and 5", 400);
  }

  // Validate SubPO belongs to this agent's order and is delivered
  const subpo = await prisma.subPO.findFirst({
    where: { id: subpo_id, order: { agent_id: agent.id } },
    include: {
      order: { select: { buyer_id: true } },
      survey: { select: { id: true } },
    },
  });

  if (!subpo) return err("SubPO not found", 404);
  if (subpo.status !== "delivered") return err("SubPO must be delivered before submitting a survey", 400);
  if (subpo.survey) return err("A survey has already been submitted for this shipment", 409);

  const overall = (delivery_score + quality_score + accuracy_score + packaging_score) / 4;
  const overall_score = parseFloat(((overall / 5) * 10).toFixed(2));

  const survey = await prisma.$transaction(async (tx) => {
    const newSurvey = await tx.subPOSurvey.create({
      data: {
        subpo_id,
        buyer_id: subpo.order.buyer_id,
        delivery_score,
        quality_score,
        accuracy_score,
        packaging_score,
        overall_score,
        comments: comments ?? null,
      },
    });

    // Recompute rolling quality_score for the supplier — using only surveys
    // scoped to this supplier's SubPOs (clean, no cross-supplier contamination)
    const supplierId = subpo.supplier_id;
    const allSurveys = await tx.subPOSurvey.findMany({
      where: { subpo: { supplier_id: supplierId } },
      select: { overall_score: true },
    });

    const avgScore = allSurveys.reduce((s, sv) => s + Number(sv.overall_score), 0) / allSurveys.length;
    await tx.supplier.update({
      where: { id: supplierId },
      data: { quality_score: parseFloat(avgScore.toFixed(2)) },
    });

    return newSurvey;
  });

  return ok(survey, 201);
}
