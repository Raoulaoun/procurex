"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, X, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Buyer {
  id: string; name: string; company: string; email: string;
  phone?: string | null; address: string | null; created_at: string;
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

function AddProspectModal({ onClose, onAdded }: { onClose: () => void; onAdded: (b: Buyer) => void }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.company || !form.email) { setError("Name, company and email are required."); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/agent/buyers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, company: form.company, email: form.email, phone: form.phone || null, address: form.address || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onAdded(data);
    else setError(data.error ?? "Failed to add prospect");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Prospect</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {[
            { key: "name", label: "Full Name", placeholder: "Ahmed Al-Rashid", required: true },
            { key: "company", label: "Company / Venue", placeholder: "Grand Ballroom Hotel", required: true },
            { key: "email", label: "Email", placeholder: "ahmed@example.com", required: true },
            { key: "phone", label: "Phone", placeholder: "+971 50 000 0000", required: false },
            { key: "address", label: "Address", placeholder: "Dubai, UAE", required: false },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type={f.key === "email" ? "email" : "text"}
                value={form[f.key as keyof typeof form]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#0d2144" }}
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Add Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProspectsPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [showModal, setShowModal] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/agent/buyers")
      .then(r => r.ok ? r.json() : [])
      .then(data => setBuyers(Array.isArray(data) ? data : []))
      .catch(() => setBuyers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleAdded(buyer: Buyer) {
    setShowModal(false);
    load();
    void buyer;
  }

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.company.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  const stages = ["prospect", "active", "returning"];
  const byStage = (stage: string) => filtered.filter(b => getStage(b) === stage);

  return (
    <div>
      {showModal && <AddProspectModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}

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
                style={view === v ? { backgroundColor: "#0d2144", color: "#fff" } : { color: "#6b7280" }}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#0d2144" }}
          >
            <Plus className="h-4 w-4" /> Add Prospect
          </button>
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
        filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
            <p className="font-medium text-gray-700 mb-1">No prospects yet</p>
            <p className="text-sm text-gray-400 mb-4">Add your first prospect to get started.</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "#0d2144" }}
            >
              <Plus className="h-4 w-4" /> Add Prospect
            </button>
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
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/agent/rfqs/new?buyer_id=${b.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                            style={{ backgroundColor: "#1e4db7" }}
                          >
                            New Quote
                          </Link>
                          <Link
                            href={`/agent/buyers/${b.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{b._count?.rfqs ?? 0} quotes</span>
                          <span>·</span>
                          <span>{b._count?.orders ?? 0} orders</span>
                        </div>
                        <Link
                          href={`/agent/rfqs/new?buyer_id=${b.id}`}
                          onClick={e => e.stopPropagation()}
                          className="px-2 py-1 rounded text-xs font-medium text-white transition-colors"
                          style={{ backgroundColor: "#1e4db7" }}
                        >
                          Quote
                        </Link>
                      </div>
                    </Link>
                  ))}

                  {/* Functional Add card */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:bg-white hover:border-gray-400 hover:text-gray-600 transition-all"
                  >
                    <Plus className="h-3 w-3" /> Add prospect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
