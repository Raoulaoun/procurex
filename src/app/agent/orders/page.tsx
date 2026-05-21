"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order {
  id: string; status: string; total_amount: string; margin_amount: string;
  created_at: string;
  buyer: { name: string; company: string };
  _count: { subpos: number };
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:           { bg: "#dbeafe", text: "#1d4ed8", label: "Confirmed" },
  processing:          { bg: "#fef3c7", text: "#b45309", label: "Processing" },
  partially_delivered: { bg: "#ede9fe", text: "#7c3aed", label: "Part. Delivered" },
  delivered:           { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: "#f3f4f6", text: "#374151", label: status };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/agent/orders")
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);
  const totalVolume = orders.reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Procurement Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Orders are created when a client confirms a quote</p>
        </div>
        <Link
          href="/agent/rfqs/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#0d2144" }}
        >
          <FileText className="h-4 w-4" /> New Quote → Order
        </Link>
      </div>

      {/* Total volume card + filters row */}
      <div className="flex items-start gap-4 mb-6">
        <div className="rounded-xl p-4 text-white min-w-48" style={{ backgroundColor: "#0d2144" }}>
          <p className="text-xs text-white/60 font-medium">Total Volume</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(totalVolume)}</p>
          <p className="text-xs text-white/40 mt-0.5">{orders.length} orders</p>
        </div>

        {/* Status filter pills */}
        <div className="flex-1 flex flex-wrap gap-2 items-center pt-2">
          {["all", "confirmed", "processing", "partially_delivered", "delivered"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={statusFilter === s
                ? { backgroundColor: "#0d2144", color: "#fff", borderColor: "#0d2144" }
                : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
              }
            >
              {s === "all" ? "All Orders" : STATUS_COLORS[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
          <p className="font-medium text-gray-700 mb-1">No orders found</p>
          <p className="text-sm text-gray-400 mb-4">Create a quote, then convert it to an order once the client confirms.</p>
          <Link
            href="/agent/rfqs/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#0d2144" }}
          >
            <FileText className="h-4 w-4" /> Create a Quote
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">POs</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Margin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={o.buyer.name} />
                      <div>
                        <p className="font-medium text-gray-900">{o.buyer.name}</p>
                        <p className="text-xs text-gray-400">{o.buyer.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-gray-700">ORD-{o.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{o._count.subpos}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(o.total_amount))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatCurrency(Number(o.margin_amount))}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/agent/orders/${o.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination hint */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Showing {filtered.length} of {orders.length} orders</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">‹</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-blue-600 text-white">1</button>
              <button className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
