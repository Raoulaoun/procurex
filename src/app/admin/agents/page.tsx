"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, Clock, ShoppingCart, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Agent {
  id: string; full_name: string; email: string; commission_rate: string; status: string;
  _count: { orders: number; commissions: number };
  commissions: { commission_earned: string; status: string }[];
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/agents")
      .then(r => r.ok ? r.json() : [])
      .then(d => setAgents(Array.isArray(d) ? d : []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = agents.reduce((s, a) =>
    s + a.commissions.reduce((cs, c) => cs + Number(c.commission_earned), 0), 0);
  const totalPending = agents.reduce((s, a) =>
    s + a.commissions.filter(c => c.status === "pending").reduce((cs, c) => cs + Number(c.commission_earned), 0), 0);
  const totalOrders = agents.reduce((s, a) => s + a._count.orders, 0);

  const summaryCards = [
    { label: "Total Agents", value: String(agents.length), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Earned", value: formatCurrency(totalEarned), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Commission", value: formatCurrency(totalPending), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Orders Handled", value: String(totalOrders), icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div>
      <div className="mb-7 pb-5 border-b">
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage procurement agents and their commissions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-0 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{c.label}</p>
                    <p className="text-xl font-bold">{c.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No agents yet</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="text-center font-semibold">Rate</TableHead>
                <TableHead className="text-center font-semibold">Orders</TableHead>
                <TableHead className="text-right font-semibold">Total Earned</TableHead>
                <TableHead className="text-right font-semibold">Pending</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map(a => {
                const earned = a.commissions.reduce((s, c) => s + Number(c.commission_earned), 0);
                const pending = a.commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.commission_earned), 0);
                return (
                  <TableRow key={a.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{a.full_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.email}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {Number(a.commission_rate)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">{a._count.orders}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(earned)}</TableCell>
                    <TableCell className="text-right text-sm">
                      {pending > 0 ? (
                        <span className="text-amber-600 font-medium">{formatCurrency(pending)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === "active" ? "success" : "secondary"}>{a.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
