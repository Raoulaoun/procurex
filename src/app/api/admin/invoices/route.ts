import { ok } from "@/lib/api-auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const invoices = await prisma.invoice.findMany({
    orderBy: { issued_at: "desc" },
    include: {
      buyer: { select: { name: true, company: true } },
      order: {
        select: {
          id: true,
          agent: { select: { full_name: true } },
        },
      },
    },
  });

  return ok(invoices);
}
