import { ok, err } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent-auth";

export async function GET() {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const buyers = await prisma.buyer.findMany({
    where: { assigned_agent_id: agent.id },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, company: true, email: true, phone: true, address: true, created_at: true,
      _count: { select: { rfqs: true, orders: true } },
    },
  });
  return ok(buyers);
}

export async function POST(req: Request) {
  const auth = await requireAgent();
  if ("error" in auth && auth.error) return auth.error;
  const { agent } = auth as { agent: { id: string } };

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.company || !body?.email) {
    return err("name, company, and email are required");
  }

  const buyer = await prisma.buyer.create({
    data: {
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone ?? null,
      address: body.address ?? null,
      assigned_agent_id: agent.id,
    },
  });
  return ok(buyer, 201);
}
