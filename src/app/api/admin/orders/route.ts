import { ok } from "@/lib/api-auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const orders = await prisma.order.findMany({
    orderBy: { created_at: "desc" },
    include: {
      buyer: { select: { name: true, company: true } },
      agent: { select: { full_name: true } },
      _count: { select: { subpos: true } },
    },
  });

  return ok(orders);
}
