"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; status: string; amount: string; issued_at: string; due_at: string;
  buyer: { name: string; company: string };
  order: { id: string };
}

const STATUS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "#f3f4f6", text: "#374151", label: "Draft" },
  sent:  { bg: "#dbeafe", text: "#1d4ed8", label: "Sent" },
  paid:  { bg: "#d1fae5", text: "#065f46", label: "Paid" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? { bg: "#f3f4f6", text: "#374151", label: status };
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/agent/invoices")
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);
  const totalAmount = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const paidAmount = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track invoices for buyers</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Invoiced</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{invoices.length} invoices</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Paid</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="rounded-xl p-4 text-white" style={{ backgroundColor: "#0d2144" }}>
          <p className="text-xs text-white/60 font-medium mb-1">Outstanding</p>
          <p className="text-xl font-bold">{formatCurrency(totalAmount - paidAmount)}</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {["all", "draft", "sent", "paid"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
            style={filter === s
              ? { backgroundColor: "#0d2144", color: "#fff", borderColor: "#0d2144" }
              : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
            }
          >
            {s === "all" ? "All" : STATUS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
          <p className="font-medium text-gray-700 mb-1">No invoices found</p>
          <p className="text-sm text-gray-400">Invoices are auto-generated when an order is confirmed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issued</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={inv.buyer.name} />
                      <div>
                        <p className="font-medium text-gray-900">{inv.buyer.name}</p>
                        <p className="text-xs text-gray-400">{inv.buyer.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-700">INV-{inv.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-500">ORD-{inv.order.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(inv.amount))}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(inv.issued_at)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(inv.due_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/agent/invoices/${inv.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View
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
