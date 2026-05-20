"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.ok ? r.json() : [])
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-wide order overview</p>
      </div>
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No orders yet</p>
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
                <TableHead>Suppliers</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-medium">ORD-{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{o.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{o.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-sm">{o.agent.full_name}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANTS[o.status] ?? "secondary"}>{STATUS_LABELS[o.status] ?? o.status}</Badge></TableCell>
                  <TableCell>{o._count.subpos}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(o.total_amount))}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">{formatCurrency(Number(o.margin_amount))}</TableCell>
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
