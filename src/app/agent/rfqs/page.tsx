"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RFQ {
  id: string; status: string; notes: string | null; created_at: string;
  buyer: { id: string; name: string; company: string };
  _count: { line_items: number };
}

const STATUS: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: "#f3f4f6", text: "#374151", label: "Draft" },
  sent:      { bg: "#fef3c7", text: "#b45309", label: "Sent" },
  confirmed: { bg: "#d1fae5", text: "#065f46", label: "Confirmed" },
  cancelled: { bg: "#fee2e2", text: "#b91c1c", label: "Cancelled" },
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

export default function RFQListPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/agent/rfqs");
    if (res.ok) setRfqs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft quotation?")) return;
    await fetch(`/api/agent/rfqs/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = filter === "all" ? rfqs : rfqs.filter(r => r.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quotations you have created for clients</p>
        </div>
        <Link
          href="/agent/rfqs/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#0d2144" }}
        >
          <Plus className="h-4 w-4" /> New Quote
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {["all", "draft", "sent", "confirmed", "cancelled"].map(s => (
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
            {s !== "all" && (
              <span className="ml-1.5 text-inherit opacity-60">
                {rfqs.filter(r => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
          <p className="font-medium text-gray-700 mb-1">No quotes found</p>
          <p className="text-sm text-gray-400 mb-4">Create your first quotation for a client.</p>
          <Link
            href="/agent/rfqs/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#0d2144" }}
          >
            <Plus className="h-4 w-4" /> New Quote
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-700">QUO-{rfq.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{rfq.buyer.name}</p>
                    <p className="text-xs text-gray-400">{rfq.buyer.company}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={rfq.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{rfq._count.line_items} product{rfq._count.line_items !== 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(rfq.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/agent/rfqs/${rfq.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </Link>
                      {rfq.status === "draft" && (
                        <button
                          onClick={() => handleDelete(rfq.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
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
