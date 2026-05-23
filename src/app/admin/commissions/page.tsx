"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign, CheckCircle2, Clock, Receipt, Loader2, X, History, AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Commission {
  id: string;
  status: "pending" | "paid";
  commission_earned: string;
  commission_rate: string;
  margin_amount: string;
  created_at: string;
  paid_at: string | null;
  agent: { id: string; full_name: string; email: string };
  order: { id: string; total_amount: string };
}

interface AuditEntry {
  id: string;
  action: "paid" | "reversed" | "bulk_paid";
  reason: string | null;
  amount_at_action: string;
  performed_at: string;
  admin: { email: string } | null;
}

const ACTION_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  paid:      { label: "Paid",        bg: "#d1fae5", text: "#065f46" },
  reversed:  { label: "Reversed",    bg: "#fee2e2", text: "#b91c1c" },
  bulk_paid: { label: "Bulk Paid",   bg: "#dbeafe", text: "#1d4ed8" },
};

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Mark Paid confirmation modal ─────────────────────────────────────────────

function MarkPaidModal({
  commission, onClose, onSuccess,
}: { commission: Commission; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/commissions/${commission.id}/mark-paid`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(data.error ?? "Failed to mark paid");
  }

  return (
    <Modal title="Mark Commission Paid" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-4">
        Mark{" "}
        <span className="font-semibold text-gray-900">{formatCurrency(Number(commission.commission_earned))}</span>{" "}
        commission for{" "}
        <span className="font-semibold text-gray-900">{commission.agent.full_name}</span>{" "}
        as paid? This will update their lifetime earnings.
      </p>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-60 transition-colors"
          style={{ backgroundColor: "#0d2144" }}
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Confirm
        </button>
      </div>
    </Modal>
  );
}

// ─── Reverse confirmation modal ───────────────────────────────────────────────

function ReverseModal({
  commission, onClose, onSuccess,
}: { commission: Commission; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    if (reason.trim().length < 5) { setError("Reason must be at least 5 characters"); return; }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/commissions/${commission.id}/reverse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(data.error ?? "Failed to reverse commission");
  }

  return (
    <Modal title="Reverse Commission Payment" onClose={onClose}>
      <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-red-700">
          This will revert the <span className="font-semibold">{formatCurrency(Number(commission.commission_earned))}</span>{" "}
          payment for <span className="font-semibold">{commission.agent.full_name}</span> back to pending and
          deduct it from their lifetime earnings.
        </p>
      </div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Reason for reversal <span className="text-red-500">*</span>
      </label>
      <textarea
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(""); }}
        rows={3}
        placeholder="Explain why this payment is being reversed…"
        className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 outline-none resize-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-colors"
      />
      {error && <p className="text-xs text-red-500 mt-1.5 mb-0">{error}</p>}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={loading || reason.trim().length < 5}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Reverse Payment
        </button>
      </div>
    </Modal>
  );
}

// ─── Bulk confirm modal ────────────────────────────────────────────────────────

function BulkModal({
  count, total, onClose, onSuccess,
}: { count: number; total: number; onClose: () => void; onSuccess: (paid: number, skipped: number) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setLoading(true);
    setError("");
    const ids = (window as unknown as { __bulkIds: string[] }).__bulkIds;
    const res = await fetch("/api/admin/commissions/bulk-mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission_ids: ids }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) onSuccess(data.paid?.length ?? 0, data.skipped?.length ?? 0);
    else setError(data.error ?? "Failed");
  }

  return (
    <Modal title="Bulk Mark Paid" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-4">
        Mark <span className="font-semibold text-gray-900">{count} commissions</span> totaling{" "}
        <span className="font-semibold text-gray-900">{formatCurrency(total)}</span> as paid?
      </p>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-60 transition-colors"
          style={{ backgroundColor: "#0d2144" }}
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Mark All Paid
        </button>
      </div>
    </Modal>
  );
}

// ─── Audit log panel ──────────────────────────────────────────────────────────

function AuditPanel({
  commissionId, onClose,
}: { commissionId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/commissions/${commissionId}/audit-log`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); });
  }, [commissionId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Audit Log</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No audit entries yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const meta = ACTION_LABELS[log.action] ?? { label: log.action, bg: "#f3f4f6", text: "#374151" };
                return (
                  <div key={log.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: meta.bg, color: meta.text }}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(log.performed_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Amount: <span className="font-semibold text-gray-700">{formatCurrency(Number(log.amount_at_action))}</span>
                    </p>
                    {log.admin && (
                      <p className="text-xs text-gray-400 mt-0.5">By: {log.admin.email}</p>
                    )}
                    {log.reason && (
                      <p className="text-xs text-gray-600 mt-2 bg-white rounded p-2 border border-gray-100">"{log.reason}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      {msg}
      <button onClick={onClose} className="ml-2 text-white/50 hover:text-white transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = ["all", "pending", "paid"] as const;
type Tab = typeof TABS[number];

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

  // Selection state (only pending rows are selectable)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modal state
  const [markPaid, setMarkPaid] = useState<Commission | null>(null);
  const [reverse, setReverse] = useState<Commission | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/commissions")
      .then(r => r.ok ? r.json() : [])
      .then(d => { setCommissions(Array.isArray(d) ? d : []); setSelected(new Set()); })
      .catch(() => setCommissions([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = tab === "all" ? commissions : commissions.filter(c => c.status === tab);

  const totalEarned  = commissions.reduce((s, c) => s + Number(c.commission_earned), 0);
  const totalPaid    = commissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.commission_earned), 0);
  const totalPending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.commission_earned), 0);

  const summaryCards = [
    { label: "Total Commissions", value: formatCurrency(totalEarned), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Paid Out",          value: formatCurrency(totalPaid),    icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Payout",    value: formatCurrency(totalPending), icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "Total Records",     value: String(commissions.length),  icon: Receipt,      color: "text-slate-600",  bg: "bg-slate-50" },
  ];

  // Bulk selection helpers
  const selectablePendingIds = useMemo(
    () => filtered.filter(c => c.status === "pending").map(c => c.id),
    [filtered]
  );
  const allSelected = selectablePendingIds.length > 0 && selectablePendingIds.every(id => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); selectablePendingIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelected(prev => new Set(Array.from(prev).concat(selectablePendingIds)));
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const selectedTotal = commissions
    .filter(c => selected.has(c.id))
    .reduce((s, c) => s + Number(c.commission_earned), 0);

  function openBulk() {
    // Stash IDs on window so BulkModal can read them without prop drilling
    (window as unknown as { __bulkIds: string[] }).__bulkIds = Array.from(selected);
    setBulkOpen(true);
  }

  function handleBulkSuccess(paid: number, skipped: number) {
    setBulkOpen(false);
    setToast(skipped > 0 ? `${paid} paid, ${skipped} skipped.` : `${paid} commissions marked paid.`);
    load();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7 pb-5 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Commissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Agent commission payout management</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                    <p className="text-xl font-bold text-gray-900">{c.value}</p>
                  </div>
                  <span className={cn("p-2 rounded-lg", c.bg)}>
                    <Icon className={cn("h-4 w-4", c.color)} />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelected(new Set()); }}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
              tab === t ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            style={tab === t ? { backgroundColor: "#0d2144" } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16">
          <p className="font-medium text-gray-700 mb-1">No commissions found</p>
          <p className="text-sm text-gray-400">Nothing matches the current filter.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-muted/30">
                {/* Checkbox column */}
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={selectablePendingIds.length === 0}
                    className="rounded border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Earned</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid At</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => {
                const isPending = c.status === "pending";
                const isSelected = selected.has(c.id);
                return (
                  <tr key={c.id} className={cn("hover:bg-gray-50 transition-colors", isSelected && "bg-blue-50/50")}>
                    <td className="px-4 py-3">
                      {isPending ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(c.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          disabled
                          title="Already paid"
                          className="rounded border-gray-200 cursor-not-allowed opacity-30"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.agent.full_name}</p>
                      <p className="text-xs text-gray-400">{c.agent.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      ORD-{c.order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(Number(c.commission_earned))}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {Number(c.commission_rate)}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={isPending
                          ? { backgroundColor: "#fef3c7", color: "#b45309" }
                          : { backgroundColor: "#d1fae5", color: "#065f46" }}
                      >
                        {isPending ? "Pending" : "Paid"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {c.paid_at ? formatDate(c.paid_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isPending && (
                          <button
                            onClick={() => setMarkPaid(c)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                            style={{ backgroundColor: "#0d2144" }}
                          >
                            Mark Paid
                          </button>
                        )}
                        {!isPending && (
                          <button
                            onClick={() => setReverse(c)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Reverse
                          </button>
                        )}
                        <button
                          onClick={() => setAuditId(c.id)}
                          title="Audit log"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl shadow-xl px-5 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: "#0d2144" }}>
          <span>{selected.size} selected · Total: {formatCurrency(selectedTotal)}</span>
          <button
            onClick={openBulk}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: "#1e4db7" }}
          >
            Mark All Paid
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      {markPaid && (
        <MarkPaidModal
          commission={markPaid}
          onClose={() => setMarkPaid(null)}
          onSuccess={() => { setMarkPaid(null); setToast("Commission marked as paid."); load(); }}
        />
      )}
      {reverse && (
        <ReverseModal
          commission={reverse}
          onClose={() => setReverse(null)}
          onSuccess={() => { setReverse(null); setToast("Commission reversed to pending."); load(); }}
        />
      )}
      {bulkOpen && (
        <BulkModal
          count={selected.size}
          total={selectedTotal}
          onClose={() => setBulkOpen(false)}
          onSuccess={handleBulkSuccess}
        />
      )}
      {auditId && (
        <AuditPanel commissionId={auditId} onClose={() => setAuditId(null)} />
      )}
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}
