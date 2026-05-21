"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Buyer {
  id: string; name: string; company: string; email: string;
  address: string | null; created_at: string;
}
interface RFQ {
  id: string; status: string; created_at: string; _count: { line_items: number };
}
interface Order {
  id: string; status: string; total_amount: string; created_at: string;
  _count: { subpos: number };
}

const RFQ_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: "#f3f4f6", text: "#374151", label: "Draft" },
  sent:      { bg: "#fef3c7", text: "#b45309", label: "Sent" },
  confirmed: { bg: "#d1fae5", text: "#065f46", label: "Confirmed" },
  cancelled: { bg: "#fee2e2", text: "#b91c1c", label: "Cancelled" },
};

const ORDER_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:           { bg: "#dbeafe", text: "#1d4ed8", label: "Confirmed" },
  processing:          { bg: "#fef3c7", text: "#b45309", label: "Processing" },
  partially_delivered: { bg: "#ede9fe", text: "#7c3aed", label: "Part. Delivered" },
  delivered:           { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
};

function StatusPill({ status, map }: { status: string; map: Record<string, { bg: string; text: string; label: string }> }) {
  const s = map[status] ?? { bg: "#f3f4f6", text: "#374151", label: status };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

export default function BuyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent/buyers").then(r => r.ok ? r.json() : []),
      fetch("/api/agent/rfqs").then(r => r.ok ? r.json() : []),
      fetch("/api/agent/orders").then(r => r.ok ? r.json() : []),
    ]).then(([buyers, allRfqs, allOrders]) => {
      const b = Array.isArray(buyers) ? buyers.find((b: Buyer) => b.id === id) : null;
      setBuyer(b ?? null);
      setRfqs(Array.isArray(allRfqs) ? allRfqs.filter((r: RFQ & { buyer: { id: string } }) => r.buyer?.id === id) : []);
      setOrders(Array.isArray(allOrders) ? allOrders.filter((o: Order & { buyer: { id: string } }) => o.buyer?.id === id) : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!buyer) return <div className="text-center py-16 text-red-500">Client not found.</div>;

  const initials = buyer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={() => router.push("/agent/buyers")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Prospects
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#0d2144" }}>
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{buyer.name}</h1>
            <p className="text-sm text-gray-500">{buyer.company}</p>
          </div>
        </div>
        <Link
          href={`/agent/rfqs/new`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#0d2144" }}
        >
          <Plus className="h-4 w-4" /> New Quote
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile + Notes */}
        <div className="space-y-4">
          {/* Client Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Client Profile</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <a href={`mailto:${buyer.email}`} className="text-sm text-blue-600 hover:underline">{buyer.email}</a>
                </div>
              </div>
              {buyer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Address</p>
                    <p className="text-sm text-gray-600">{buyer.address}</p>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{rfqs.length}</p>
                    <p className="text-xs text-gray-400">Quotes</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-400">Orders</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Client since {formatDate(buyer.created_at)}</p>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Internal Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes about this client…"
              rows={4}
              className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
            <button className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              Save Notes
            </button>
          </div>
        </div>

        {/* Right: Orders + Quotes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Recent Orders</h3>
              <Link href="/agent/orders" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No orders yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">ORD-{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3"><StatusPill status={o.status} map={ORDER_STATUS} /></td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(o.total_amount))}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/agent/orders/${o.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Linked Quotes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Linked Quotes</h3>
              <Link href="/agent/rfqs" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {rfqs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No quotes yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {rfqs.slice(0, 5).map((r) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="font-mono text-xs font-semibold text-gray-700">QUO-{r.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-xs text-gray-400 ml-3">{r._count.line_items} items · {formatDate(r.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={r.status} map={RFQ_STATUS} />
                      <Link href={`/agent/rfqs/${r.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
