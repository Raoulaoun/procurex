"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Users, ClipboardList, DollarSign, Plus, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  rfq_counts: { draft: number; sent: number; confirmed: number; total: number };
  order_counts: { confirmed: number; processing: number; delivered: number; total: number };
  commission_totals: { total_earned: number; total_pending: number };
  buyer_count: number;
  recent_orders: { id: string; status: string; total_amount: string; created_at: string; buyer: { name: string; company: string } }[];
  recent_rfqs: { id: string; status: string; created_at: string; buyer: { name: string; company: string }; _count: { line_items: number } }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  sent: "#f59e0b",
  confirmed: "#10b981",
  cancelled: "#ef4444",
  processing: "#3b82f6",
  partially_delivered: "#8b5cf6",
  delivered: "#10b981",
  paid: "#10b981",
  pending: "#f59e0b",
};

const STATUS_BG: Record<string, string> = {
  draft: "#f3f4f6",
  sent: "#fef3c7",
  confirmed: "#d1fae5",
  cancelled: "#fee2e2",
  processing: "#dbeafe",
  partially_delivered: "#ede9fe",
  delivered: "#d1fae5",
  paid: "#d1fae5",
  pending: "#fef3c7",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ backgroundColor: STATUS_BG[status] ?? "#f3f4f6", color: STATUS_COLORS[status] ?? "#6b7280" }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

const FUNNEL_STAGES = [
  { key: "prospects", label: "Prospects", color: "#0d2144" },
  { key: "quotes", label: "Quotes Sent", color: "#1e4db7" },
  { key: "confirmed", label: "Confirmed", color: "#3b82f6" },
  { key: "delivered", label: "Delivered", color: "#10b981" },
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#0d2144", "#1e4db7", "#7c3aed", "#059669", "#d97706"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

export default function AgentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/agent/profile")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setCommissionRate(d.commission_rate))
      .catch(() => null);

    Promise.all([
      fetch("/api/agent/rfqs").then(r => r.ok ? r.json() : []),
      fetch("/api/agent/orders").then(r => r.ok ? r.json() : []),
      fetch("/api/agent/commissions").then(r => r.ok ? r.json() : { commissions: [], totals: { total_earned: 0, total_pending: 0, total_paid: 0 } }),
      fetch("/api/agent/buyers").then(r => r.ok ? r.json() : []),
    ]).then(([rfqs, orders, commData, buyers]) => {
      const rfqArr = Array.isArray(rfqs) ? rfqs : [];
      const orderArr = Array.isArray(orders) ? orders : [];
      const buyerArr = Array.isArray(buyers) ? buyers : [];

      setData({
        rfq_counts: {
          draft: rfqArr.filter((r: { status: string }) => r.status === "draft").length,
          sent: rfqArr.filter((r: { status: string }) => r.status === "sent").length,
          confirmed: rfqArr.filter((r: { status: string }) => r.status === "confirmed").length,
          total: rfqArr.length,
        },
        order_counts: {
          confirmed: orderArr.filter((o: { status: string }) => o.status === "confirmed").length,
          processing: orderArr.filter((o: { status: string }) => ["processing", "partially_delivered"].includes(o.status)).length,
          delivered: orderArr.filter((o: { status: string }) => o.status === "delivered").length,
          total: orderArr.length,
        },
        commission_totals: {
          total_earned: commData?.totals?.total_earned ?? 0,
          total_pending: commData?.totals?.total_pending ?? 0,
        },
        buyer_count: buyerArr.length,
        recent_orders: orderArr.slice(0, 5),
        recent_rfqs: rfqArr.slice(0, 5),
      });
    }).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const funnelData = [
    { ...FUNNEL_STAGES[0], count: data?.buyer_count ?? 0 },
    { ...FUNNEL_STAGES[1], count: data?.rfq_counts.sent ?? 0 },
    { ...FUNNEL_STAGES[2], count: data?.rfq_counts.confirmed ?? 0 },
    { ...FUNNEL_STAGES[3], count: data?.order_counts.delivered ?? 0 },
  ];
  const maxCount = Math.max(...funnelData.map(f => f.count), 1);

  const kpis = [
    { label: "Total Clients", value: data?.buyer_count ?? 0, suffix: "", delta: null },
    { label: "Active Convos", value: data?.rfq_counts.sent ?? 0, suffix: "", delta: null },
    { label: "Quotes Sent", value: data?.rfq_counts.total ?? 0, suffix: "", delta: null },
    { label: "Deals Closed", value: data?.order_counts.delivered ?? 0, suffix: "", delta: null },
    { label: "Total Earned", value: formatCurrency(data?.commission_totals.total_earned ?? 0), suffix: "", isText: true, delta: null },
    { label: "Commission Rate", value: commissionRate !== null ? `${commissionRate}%` : "—", suffix: "", delta: null },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your procurement activity at a glance</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link
          href="/agent/rfqs/new"
          className="group flex items-center gap-3 p-4 rounded-xl border-2 text-white transition-all hover:opacity-90 hover:shadow-md"
          style={{ backgroundColor: "#0d2144", borderColor: "#0d2144" }}
        >
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white">New Quote</p>
            <p className="text-xs text-white/60 truncate">Create a quotation</p>
          </div>
        </Link>

        <Link
          href="/agent/buyers#add"
          className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md hover:border-blue-200"
        >
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: "#eff6ff" }}>
            <Users className="h-5 w-5" style={{ color: "#1e4db7" }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900">Add Client</p>
            <p className="text-xs text-gray-400 truncate">New client</p>
          </div>
        </Link>

        <Link
          href="/agent/orders"
          className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md hover:border-blue-200"
        >
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: "#f0fdf4" }}>
            <ClipboardList className="h-5 w-5" style={{ color: "#059669" }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900">View Orders</p>
            <p className="text-xs text-gray-400 truncate">Track deliveries</p>
          </div>
        </Link>

        <Link
          href="/agent/commissions"
          className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md hover:border-blue-200"
        >
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: "#fffbeb" }}>
            <DollarSign className="h-5 w-5" style={{ color: "#d97706" }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900">Commissions</p>
            <p className="text-xs text-gray-400 truncate">Track earnings</p>
          </div>
        </Link>
      </div>

      {/* KPI cards */}
      {(() => {
        const kpiLinks = ["/agent/buyers", "/agent/rfqs", "/agent/rfqs", "/agent/orders", "/agent/commissions", "/agent/commissions" ];
        return (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {kpis.map((kpi, i) => (
              <Link key={kpi.label} href={kpiLinks[i]} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group">
                <p className="text-xs text-gray-500 font-medium mb-1">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 transition-colors mb-1" />
                </div>
              </Link>
            ))}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Sales Pipeline Velocity</h2>
          <div className="space-y-3">
            {funnelData.map((stage, i) => {
              const widthPct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
              const indent = i * 8;
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{stage.label}</span>
                    <span className="font-semibold text-gray-900">{stage.count}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-md overflow-hidden" style={{ marginLeft: indent }}>
                    <div
                      className="h-full rounded-md transition-all duration-500 flex items-center pl-3"
                      style={{ width: `${Math.max(widthPct, 8)}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/agent/orders" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          {(!data?.recent_orders.length && !data?.recent_rfqs.length) ? (
            <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {data?.recent_rfqs.slice(0, 3).map(rfq => (
                <Link key={rfq.id} href={`/agent/rfqs/${rfq.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <Avatar name={rfq.buyer.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{rfq.buyer.name}</p>
                    <p className="text-xs text-gray-500 truncate">Quote QUO-{rfq.id.slice(0, 8).toUpperCase()} · {rfq._count.line_items} items</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={rfq.status} />
                    <span className="text-xs text-gray-400">{formatDate(rfq.created_at)}</span>
                  </div>
                </Link>
              ))}
              {data?.recent_orders.slice(0, 3).map(order => (
                <Link key={order.id} href={`/agent/orders/${order.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <Avatar name={order.buyer.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.buyer.name}</p>
                    <p className="text-xs text-gray-500 truncate">Order ORD-{order.id.slice(0, 8).toUpperCase()} · {formatCurrency(Number(order.total_amount))}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={order.status} />
                    <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Pending Commission</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(data?.commission_totals.total_pending ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.commission_totals.total_earned ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="rounded-xl p-5 text-white" style={{ backgroundColor: "#0d2144" }}>
          <p className="text-xs text-white/60 font-medium mb-1">Active Orders</p>
          <p className="text-2xl font-bold">{data?.order_counts.processing ?? 0}</p>
          <p className="text-xs text-white/40 mt-1">{data?.order_counts.confirmed ?? 0} confirmed · {data?.order_counts.delivered ?? 0} delivered</p>
        </div>
      </div>
    </div>
  );
}
