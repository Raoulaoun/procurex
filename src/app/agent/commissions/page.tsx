"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Commission {
  id: string; status: string;
  margin_amount: string; commission_rate: string; commission_earned: string;
  created_at: string; paid_at: string | null;
  order: { id: string; status: string; created_at: string; buyer: { name: string; company: string } };
}

interface Data {
  commissions: Commission[];
  totals: { total_earned: number; total_pending: number; total_paid: number };
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

export default function CommissionsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/commissions")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const quota = 5000;
  const earned = data?.totals.total_earned ?? 0;
  const quotaPct = Math.min((earned / quota) * 100, 100);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Commissions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your earnings from confirmed orders</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pending */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Pending Commissions</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(data?.totals.total_pending ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting payout</p>
        </div>

        {/* Total Earned */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Earned MTD</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(earned)}</p>
          <p className="text-xs text-gray-400 mt-1">All time earnings</p>
        </div>

        {/* Projected — dark card */}
        <div className="rounded-xl p-5 text-white" style={{ backgroundColor: "#0d2144" }}>
          <p className="text-xs text-white/60 font-medium mb-1">Projected Earnings</p>
          <p className="text-2xl font-bold">{formatCurrency((data?.totals.total_paid ?? 0) + (data?.totals.total_pending ?? 0))}</p>
          <p className="text-xs text-white/40 mt-1">Paid + pending</p>
        </div>
      </div>

      {/* Quota progress */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Quota Progress</p>
            <p className="text-xs text-gray-400 mt-0.5">Monthly target: {formatCurrency(quota)}</p>
          </div>
          <span className="text-sm font-bold text-gray-900">{quotaPct.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${quotaPct}%`, backgroundColor: quotaPct >= 100 ? "#10b981" : "#1e4db7" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{formatCurrency(earned)} earned</span>
          <span>{formatCurrency(Math.max(quota - earned, 0))} remaining</span>
        </div>
      </div>

      {/* Commission log */}
      {!data || data.commissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
          <p className="font-medium text-gray-700 mb-1">No commissions yet</p>
          <p className="text-sm text-gray-400">Commissions are generated when orders are confirmed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Commission Log</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Margin</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commission</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.order.buyer.name} />
                      <div>
                        <p className="font-medium text-gray-900">{c.order.buyer.name}</p>
                        <p className="text-xs text-gray-400">{c.order.buyer.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-gray-700">ORD-{c.order.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(Number(c.margin_amount))}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{Number(c.commission_rate)}%</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${c.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {formatCurrency(Number(c.commission_earned))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={c.status === "paid"
                        ? { backgroundColor: "#d1fae5", color: "#065f46" }
                        : { backgroundColor: "#fef3c7", color: "#b45309" }
                      }
                    >
                      {c.status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.paid_at ? formatDate(c.paid_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/agent/orders/${c.order.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
