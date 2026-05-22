import { ok, err, requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const body = await req.json();
  const { full_name, email, commission_rate } = body;

  if (!full_name || !email || commission_rate === undefined) {
    return err("full_name, email, and commission_rate are required");
  }

  const rate = Number(commission_rate);
  if (isNaN(rate) || rate < 5 || rate > 25) {
    return err("commission_rate must be between 5 and 25");
  }

  // Check for duplicate email
  const existing = await prisma.agent.findUnique({ where: { email } });
  if (existing) return err("An agent with this email already exists", 409);

  // In dev mode, generate a random UUID for user_id (in production this would be the Supabase auth user id)
  const userId = randomUUID();

  const agent = await prisma.$transaction(async (tx) => {
    await tx.userProfile.create({
      data: { id: userId, email, role: "agent" },
    });
    return tx.agent.create({
      data: { user_id: userId, full_name, email, commission_rate: rate },
    });
  });

  return ok(agent, 201);
}
