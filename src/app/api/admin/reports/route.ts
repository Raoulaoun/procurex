import { ok } from "@/lib/api-auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const [orders, commissions, suppliers, agents, buyers] = await Promise.all([
    prisma.order.findMany({
      include: {
        buyer: { select: { id: true, name: true, company: true } },
        agent: { select: { id: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.commission.findMany({
      include: { agent: { select: { id: true, full_name: true, email: true } } },
    }),
    prisma.supplier.findMany({
      select: {
        id: true, name: true, country: true, quality_score: true, status: true,
        _count: { select: { subpos: true } },
      },
      orderBy: { quality_score: "desc" },
    }),
    prisma.agent.findMany({
      select: { id: true, full_name: true, email: true, commission_rate: true },
    }),
    prisma.buyer.findMany({
      select: { id: true, name: true, company: true },
    }),
  ]);

  // ── Overview KPIs ─────────────────────────────────────────────────────────
  const total_revenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const total_cost = orders.reduce((s, o) => s + Number(o.cost_amount), 0);
  const total_margin = orders.reduce((s, o) => s + Number(o.margin_amount), 0);
  const total_commission = commissions.reduce((s, c) => s + Number(c.commission_earned), 0);

  const overview = {
    total_revenue,
    total_cost,
    total_margin,
    total_orders: orders.length,
    total_commission,
    active_agents: agents.length,
    active_buyers: buyers.length,
    avg_margin_pct: total_revenue > 0 ? (total_margin / total_revenue) * 100 : 0,
  };

  // ── Monthly revenue (last 12 months) ──────────────────────────────────────
  const monthlyMap: Record<string, { revenue: number; cost: number; margin: number; orders: number }> = {};
  const now = new Date();
  // Pre-fill 12 months so months with no orders still appear
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = { revenue: 0, cost: 0, margin: 0, orders: 0 };
  }
  for (const o of orders) {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += Number(o.total_amount);
      monthlyMap[key].cost += Number(o.cost_amount);
      monthlyMap[key].margin += Number(o.margin_amount);
      monthlyMap[key].orders += 1;
    }
  }
  const monthly = Object.entries(monthlyMap).map(([month, v]) => ({
    month,
    label: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    ...v,
  }));

  // ── Top buyers by spend ───────────────────────────────────────────────────
  const buyerMap: Record<string, { name: string; company: string; spend: number; orders: number }> = {};
  for (const o of orders) {
    const bid = o.buyer_id;
    if (!buyerMap[bid]) buyerMap[bid] = { name: o.buyer.name, company: o.buyer.company, spend: 0, orders: 0 };
    buyerMap[bid].spend += Number(o.total_amount);
    buyerMap[bid].orders += 1;
  }
  const top_buyers = Object.values(buyerMap)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  // ── Agent performance ─────────────────────────────────────────────────────
  const agentCommMap: Record<string, { full_name: string; email: string; commission_rate: number; earned: number; pending: number; order_count: number }> = {};
  for (const a of agents) {
    agentCommMap[a.id] = { full_name: a.full_name, email: a.email, commission_rate: Number(a.commission_rate), earned: 0, pending: 0, order_count: 0 };
  }
  for (const c of commissions) {
    const aid = c.agent_id;
    if (agentCommMap[aid]) {
      agentCommMap[aid].earned += Number(c.commission_earned);
      if (c.status === "pending") agentCommMap[aid].pending += Number(c.commission_earned);
      agentCommMap[aid].order_count += 1;
    }
  }
  const agent_performance = Object.values(agentCommMap).sort((a, b) => b.earned - a.earned);

  // ── Supplier health ───────────────────────────────────────────────────────
  const supplier_health = suppliers.map(s => ({
    name: s.name,
    country: s.country,
    quality_score: Number(s.quality_score),
    order_count: s._count.subpos,
    status: s.status,
  }));

  return ok({ overview, monthly, top_buyers, agent_performance, supplier_health });
}
