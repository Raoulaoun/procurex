"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ShoppingCart, Receipt, DollarSign, PlusCircle, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  rfq_counts: { draft: number; sent: number; confirmed: number };
  order_counts: { confirmed: number; processing: number; delivered: number };
  commission_totals: { total_earned: number; total_pending: number };
  recent_orders: { id: string; status: string; total_amount: string; created_at: string; buyer: { name: string; company: string } }[];
  recent_rfqs: { id: string; status: string; created_at: string; buyer: { name: string; company: string }; _count: { line_items: number } }[];
}

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  draft: "secondary", sent: "warning", confirmed: "success", cancelled: "destructive",
  processing: "warning", partially_delivered: "warning", delivered: "success",
};

export default function AgentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent/rfqs").then(r => r.ok ? r.json() : []),
      fetch("/api/agent/orders").then(r => r.ok ? r.json() : []),
      fetch("/api/agent/commissions").then(r => r.ok ? r.json() : { commissions: [], totals: { total_earned: 0, total_pending: 0, total_paid: 0 } }),
    ]).then(([rfqs, orders, commData]) => {
      const rfqArr = Array.isArray(rfqs) ? rfqs : [];
      const orderArr = Array.isArray(orders) ? orders : [];

      setData({
        rfq_counts: {
          draft: rfqArr.filter((r: { status: string }) => r.status === "draft").length,
          sent: rfqArr.filter((r: { status: string }) => r.status === "sent").length,
          confirmed: rfqArr.filter((r: { status: string }) => r.status === "confirmed").length,
        },
        order_counts: {
          confirmed: orderArr.filter((o: { status: string }) => o.status === "confirmed").length,
          processing: orderArr.filter((o: { status: string }) => ["processing", "partially_delivered"].includes(o.status)).length,
          delivered: orderArr.filter((o: { status: string }) => o.status === "delivered").length,
        },
        commission_totals: {
          total_earned: commData?.totals?.total_earned ?? 0,
          total_pending: commData?.totals?.total_pending ?? 0,
        },
        recent_orders: orderArr.slice(0, 3),
        recent_rfqs: rfqArr.slice(0, 3),
      });
    }).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your procurement activity at a glance</p>
        </div>
        <Button asChild size="sm">
          <Link href="/agent/rfqs/new"><PlusCircle className="h-4 w-4 mr-1.5" /> New RFQ</Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Active Quotes</p>
            </div>
            <p className="text-2xl font-bold">{data?.rfq_counts.sent ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{data?.rfq_counts.draft ?? 0} drafts · {data?.rfq_counts.confirmed ?? 0} confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Active Orders</p>
            </div>
            <p className="text-2xl font-bold">{data?.order_counts.processing ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{data?.order_counts.confirmed ?? 0} confirmed · {data?.order_counts.delivered ?? 0} delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Pending Commission</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(data?.commission_totals.total_pending ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.commission_totals.total_earned ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Quotations</CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link href="/agent/rfqs">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {!data?.recent_rfqs.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No quotations yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recent_rfqs.map(rfq => (
                  <div key={rfq.id} className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium">QUO-{rfq.id.slice(0, 8).toUpperCase()}</span>
                        <Badge variant={STATUS_VARIANTS[rfq.status] ?? "secondary"} className="text-[10px] px-1.5 py-0">{rfq.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rfq.buyer.name} · {rfq._count.line_items} items · {formatDate(rfq.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/agent/rfqs/${rfq.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link href="/agent/orders">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {!data?.recent_orders.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recent_orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium">ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                        <Badge variant={STATUS_VARIANTS[order.status] ?? "secondary"} className="text-[10px] px-1.5 py-0">{order.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.buyer.name} · {formatCurrency(Number(order.total_amount))} · {formatDate(order.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/agent/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
