import { requireAdmin, ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET: List all commissions with agent and order context, ordered newest first.
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const commissions = await prisma.commission.findMany({
    orderBy: { created_at: "desc" },
    include: {
      agent: { select: { id: true, full_name: true, email: true } },
      order: { select: { id: true, total_amount: true } },
    },
  });

  return ok(commissions);
}
