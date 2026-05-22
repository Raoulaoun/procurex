"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof TABS[number]>("all");

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-wide order overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders",  value: orders.length },
          { label: "Confirmed",     value: orders.filter(o => o.status === "confirmed").length },
          { label: "In Transit",    value: orders.filter(o => ["processing","partially_delivered"].includes(o.status)).length },
          { label: "Delivered",     value: orders.filter(o => o.status === "delivered").length },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-muted p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={tab === t ? { backgroundColor: "#0d2144", color: "#fff" } : { color: "#6b7280" }}
          >
            {t === "all" ? "All" : STATUS_LABELS[t]} ({t === "all" ? orders.length : orders.filter(o => o.status === t).length})
          </button>
        ))}
      </div>

      {/* Revenue summary for current tab */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-6 mb-4 px-1 text-sm text-muted-foreground">
          <span>Revenue: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span></span>
          <span>Margin: <span className="font-semibold text-green-600">{formatCurrency(totalMargin)}</span></span>
          <span>Margin %: <span className="font-semibold text-foreground">{marginPct.toFixed(1)}%</span></span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No orders found</p>
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Suppliers</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-medium">ORD-{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{o.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{o.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-sm">{o.agent.full_name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[o.status] ?? "secondary"}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{o._count.subpos}</TableCell>
                  <TableCell className="text-right font-medium text-sm">{formatCurrency(Number(o.total_amount))}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium text-sm">{formatCurrency(Number(o.margin_amount))}</TableCell>
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
