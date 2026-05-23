import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch a single SubPO survey (agent must own the parent order)
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };
  const { id } = await params;

  const survey = await prisma.subPOSurvey.findFirst({
    where: { id, subpo: { order: { agent_id: agent.id } } },
    include: {
      subpo: {
        select: {
          id: true,
          supplier: { select: { name: true, country: true } },
          order: {
            select: {
              id: true,
              total_amount: true,
            },
          },
        },
      },
      buyer: { select: { name: true, company: true } },
    },
  });

  if (!survey) return err("Survey not found", 404);
  return ok(survey);
}
