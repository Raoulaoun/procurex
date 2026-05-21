"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Buyer {
  id: string; name: string; company: string; email: string;
  address: string | null; created_at: string;
  _count?: { rfqs: number; orders: number };
}

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  prospect:  { bg: "#f3f4f6", text: "#374151" },
  active:    { bg: "#d1fae5", text: "#065f46" },
  returning: { bg: "#dbeafe", text: "#1d4ed8" },
};

function getStage(buyer: Buyer): string {
  const orders = buyer._count?.orders ?? 0;
  const rfqs = buyer._count?.rfqs ?? 0;
  if (orders > 1) return "returning";
  if (orders > 0) return "active";
  if (rfqs > 0) return "prospect";
  return "prospect";
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#0d2144", "#1e4db7", "#7c3aed", "#059669", "#d97706"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

export default function ProspectsPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");

  useEffect(() => {
    fetch("/api/agent/buyers")
      .then(r => r.ok ? r.json() : [])
      .then(data => setBuyers(Array.isArray(data) ? data : []))
      .catch(() => setBuyers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.company.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  const stages = ["prospect", "active", "returning"];
  const byStage = (stage: string) => filtered.filter(b => getStage(b) === stage);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prospects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your clients and buyer relationships</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {(["list", "kanban"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-medium transition-colors capitalize"
                style={view === v
                  ? { backgroundColor: "#0d2144", color: "#fff" }
                  : { color: "#6b7280" }
                }
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {stages.map(s => (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white"
              style={{ color: STAGE_COLORS[s].text }}>
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[s].text }} />
              {s.charAt(0).toUpperCase() + s.slice(1)} · {byStage(s).length}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : view === "list" ? (
        /* List view */
        filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
            <p className="font-medium text-gray-700 mb-1">No prospects found</p>
            <p className="text-sm text-gray-400">Buyers are added by the admin.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quotes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Since</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => {
                  const stage = getStage(b);
                  const sc = STAGE_COLORS[stage];
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={b.name} />
                          <span className="font-medium text-gray-900">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.company}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{b.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{b._count?.rfqs ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">{b._count?.orders ?? 0}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(b.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/agent/buyers/${b.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Kanban view */
        <div className="grid grid-cols-3 gap-4">
          {stages.map(stage => {
            const cards = byStage(stage);
            const sc = STAGE_COLORS[stage];
            return (
              <div key={stage} className="bg-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: sc.text }} />
                    <span className="text-xs font-semibold text-gray-700 capitalize">{stage}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{cards.length}</span>
                </div>

                <div className="space-y-2">
                  {cards.map(b => (
                    <Link key={b.id} href={`/agent/buyers/${b.id}`}
                      className="block bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar name={b.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                          <p className="text-xs text-gray-400 truncate">{b.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{b._count?.rfqs ?? 0} quotes</span>
                        <span>·</span>
                        <span>{b._count?.orders ?? 0} orders</span>
                      </div>
                    </Link>
                  ))}

                  {/* Add card placeholder */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:bg-white transition-colors cursor-default">
                    <Plus className="h-3 w-3" /> Add prospect
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
