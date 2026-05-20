"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users, Truck, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Overview {
  total_revenue: number; total_cost: number; total_margin: number;
  total_orders: number; total_commission: number;
  active_agents: number; active_buyers: number; avg_margin_pct: number;
}
interface MonthlyPoint {
  month: string; label: string; revenue: number; cost: number; margin: number; orders: number;
}
interface BuyerRow { name: string; company: string; spend: number; orders: number }
interface AgentRow { full_name: string; email: string; commission_rate: number; earned: number; pending: number; order_count: number }
interface SupplierRow { name: string; country: string; quality_score: number; order_count: number; status: string }

interface ReportData {
  overview: Overview;
  monthly: MonthlyPoint[];
  top_buyers: BuyerRow[];
  agent_performance: AgentRow[];
  supplier_health: SupplierRow[];
}

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("h-4 w-4", color ?? "text-muted-foreground")} />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className={cn("text-2xl font-bold mt-0.5", color)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "bg-green-500" : score >= 5 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

const CHART_COLORS = { revenue: "#3b82f6", cost: "#94a3b8", margin: "#22c55e" };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-6">
          <span className="capitalize">{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground text-sm">Loading analytics…</div>;
  if (!data) return <div className="text-center py-20 text-destructive">Failed to load report data.</div>;

  const { overview, monthly, top_buyers, agent_performance, supplier_health } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-wide performance — all time</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={DollarSign} label="Total Revenue" value={formatCurrency(overview.total_revenue)} sub={`${formatCurrency(overview.total_margin)} margin`} color="text-blue-600" />
        <KpiCard icon={TrendingUp} label="Avg Margin" value={`${overview.avg_margin_pct.toFixed(1)}%`} sub={`${formatCurrency(overview.total_commission)} commission paid`} color="text-green-600" />
        <KpiCard icon={ShoppingCart} label="Total Orders" value={String(overview.total_orders)} sub={`${overview.active_buyers} buyers`} />
        <KpiCard icon={Users} label="Active Agents" value={String(overview.active_agents)} sub={`${formatCurrency(overview.total_commission)} total commission`} />
      </div>

      {/* Revenue chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue, Cost & Margin — Last 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.every(m => m.revenue === 0) ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No order data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.revenue} radius={[2, 2, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill={CHART_COLORS.cost} radius={[2, 2, 0, 0]} />
                <Bar dataKey="margin" name="Margin" fill={CHART_COLORS.margin} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Order volume line */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Order Volume — Last 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.every(m => m.orders === 0) ? (
            <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">No order data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={32} />
                <Tooltip formatter={(v) => [typeof v === "number" ? v : 0, "Orders"]} labelFormatter={l => l as string} />
                <Line dataKey="orders" name="Orders" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top buyers */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Top Buyers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {top_buyers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div className="space-y-3">
                {top_buyers.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.company} · {b.orders} order{b.orders !== 1 ? "s" : ""}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0">{formatCurrency(b.spend)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent performance */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {agent_performance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div className="space-y-3">
                {agent_performance.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.full_name}</p>
                      <p className="text-xs text-muted-foreground">{a.order_count} orders · {a.commission_rate}% rate</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">{formatCurrency(a.earned)}</p>
                      {a.pending > 0 && <p className="text-xs text-amber-600">{formatCurrency(a.pending)} pending</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplier health */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" /> Supplier Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {supplier_health.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div className="space-y-3">
                {supplier_health.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">{s.country}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{s.order_count} POs</span>
                    </div>
                    <ScoreBar score={s.quality_score} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full supplier table */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" /> Supplier Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">POs Received</TableHead>
                <TableHead>Quality Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplier_health.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No suppliers yet</TableCell></TableRow>
              ) : supplier_health.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.country}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{s.order_count}</TableCell>
                  <TableCell className="w-40"><ScoreBar score={s.quality_score} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
