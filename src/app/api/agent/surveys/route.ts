import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const surveys = await prisma.qASurvey.findMany({
    where: { order: { agent_id: agent.id } },
    orderBy: { submitted_at: "desc" },
    include: {
      order: { select: { id: true } },
      buyer: { select: { name: true, company: true } },
    },
  });

  return ok(surveys);
}

export async function POST(req: NextRequest) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const body = await req.json();
  const { order_id, delivery_score, quality_score, accuracy_score, packaging_score, comments } = body;

  // Validate scores
  const scores = [delivery_score, quality_score, accuracy_score, packaging_score];
  if (scores.some((s) => typeof s !== "number" || s < 1 || s > 5)) {
    return err("All scores must be integers between 1 and 5", 400);
  }

  // Check order belongs to agent and is delivered
  const order = await prisma.order.findFirst({
    where: { id: order_id, agent_id: agent.id },
    include: {
      surveys: true,
      subpos: { select: { supplier_id: true, status: true } },
    },
  });

  if (!order) return err("Order not found", 404);
  if (order.status !== "delivered") return err("Order must be fully delivered before submitting a QA survey", 400);
  if (order.surveys.length > 0) return err("A survey has already been submitted for this order", 409);

  const overall = (delivery_score + quality_score + accuracy_score + packaging_score) / 4;
  // Scale to 0–10
  const overall_score = parseFloat(((overall / 5) * 10).toFixed(2));

  const survey = await prisma.$transaction(async (tx) => {
    const newSurvey = await tx.qASurvey.create({
      data: {
        order_id,
        buyer_id: order.buyer_id,
        delivery_score,
        quality_score,
        accuracy_score,
        packaging_score,
        overall_score,
        comments: comments ?? null,
      },
    });

    // Update rolling quality_score for each supplier involved in this order
    for (const subpo of order.subpos) {
      const supplierId = subpo.supplier_id;

      // Count all delivered orders for this supplier and calculate new rolling average
      const allSurveys = await tx.qASurvey.findMany({
        where: { order: { subpos: { some: { supplier_id: supplierId } } } },
      });

      const count = allSurveys.length; // includes the one we just created
      const avgScore = count > 0
        ? allSurveys.reduce((s, sv) => s + Number(sv.overall_score), 0) / count
        : overall_score;

      await tx.supplier.update({
        where: { id: supplierId },
        data: { quality_score: parseFloat(avgScore.toFixed(2)) },
      });
    }

    return newSurvey;
  });

  return ok(survey, 201);
}
