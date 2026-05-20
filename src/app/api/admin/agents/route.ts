import { ok } from "@/lib/api-auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const agents = await prisma.agent.findMany({
    orderBy: { full_name: "asc" },
    include: {
      commissions: { select: { commission_earned: true, status: true } },
      _count: { select: { orders: true, commissions: true } },
    },
  });

  return ok(agents);
}
