import { ok } from "@/lib/api-auth";
import { requireAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, name_ar: true,
      subcategories: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, name_ar: true },
      },
    },
  });
  return ok(categories);
}
