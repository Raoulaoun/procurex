"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, CheckCircle2, Truck, PackageCheck, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order {
  id: string; status: string; total_amount: string; margin_amount: string; created_at: string;
  buyer: { name: string; company: string };
  agent: { full_name: string };
  _count: { subpos: number };
}

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  confirmed: "secondary", processing: "warning", partially_delivered: "warning", delivered: "success",
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed", processing: "Processing",
  partially_delivered: "Part. Delivered", delivered: "Delivered",
};
const TABS = ["all", "confirmed", "processing", "partially_delivered", "delivered"] as const;
type Tab = typeof TABS[number];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.ok ? r.json() : [])
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? orders : orders.filter(o => o.status === tab);
  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalMargin  = filtered.reduce((s, o) => s + Number(o.margin_amount), 0);
  const marginPct    = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const summaryCards = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Confirmed", value: orders.filter(o => o.status === "confirmed").length, icon: CheckCircle2, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "In Transit", value: orders.filter(o => ["processing", "partially_delivered"].includes(o.status)).length, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, icon: PackageCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div>
      <div className="mb-7 pb-5 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">All Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide order overview</p>
        </div>
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
                    <p className="text-3xl font-bold">{c.value}</p>
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

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-muted/60 p-1 rounded-lg w-fit">
        {TABS.map(t => {
          const count = t === "all" ? orders.length : orders.filter(o => o.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={tab === t
                ? { backgroundColor: "#0d2144", color: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
                : { color: "#6b7280" }}
            >
              {t === "all" ? "All" : STATUS_LABELS[t]} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Revenue summary for current tab */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-6 mb-4 px-1">
          <div className="text-sm">
            <span className="text-muted-foreground">Revenue </span>
            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Margin </span>
            <span className="font-semibold text-emerald-600">{formatCurrency(totalMargin)}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Margin% </span>
            <span className="font-semibold">{marginPct.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No orders found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Reference</TableHead>
                <TableHead className="font-semibold">Buyer</TableHead>
                <TableHead className="font-semibold">Agent</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold">Suppliers</TableHead>
                <TableHead className="text-right font-semibold">Revenue</TableHead>
                <TableHead className="text-right font-semibold">Margin</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                    ORD-{o.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{o.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{o.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.agent.full_name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[o.status] ?? "secondary"}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{o._count.subpos}</TableCell>
                  <TableCell className="text-right font-semibold text-sm">{formatCurrency(Number(o.total_amount))}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-semibold text-sm">{formatCurrency(Number(o.margin_amount))}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
