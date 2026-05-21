"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, MapPin, User, Star } from "lucide-react";

interface SubPOLine { id: string; quantity: string; unit_price: string; product: { name: string; unit: string } }
interface SubPO {
  id: string; status: string; total_amount: string; sent_at: string | null;
  acknowledged_at: string | null; dispatched_at: string | null; delivered_at: string | null;
  supplier: { id: string; name: string; country: string };
  line_items: SubPOLine[];
}
interface Order {
  id: string; status: string; total_amount: string; cost_amount: string;
  margin_amount: string; created_at: string;
  buyer: { name: string; company: string; email: string; address: string | null };
  rfq: { id: string; notes: string | null };
  subpos: SubPO[];
  commission: { commission_earned: string; commission_rate: string; status: string } | null;
  survey_submitted: boolean;
  survey_id: string | null;
}

const ORDER_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:           { bg: "#dbeafe", text: "#1d4ed8", label: "Confirmed" },
  processing:          { bg: "#fef3c7", text: "#b45309", label: "Processing" },
  partially_delivered: { bg: "#ede9fe", text: "#7c3aed", label: "Partially Delivered" },
  delivered:           { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
};

const STEPS = [
  { key: "sent",         label: "Processed" },
  { key: "acknowledged", label: "Ready" },
  { key: "dispatched",   label: "In Transit" },
  { key: "delivered",    label: "Delivered" },
];

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  sent:         { label: "Mark Ready", value: "acknowledged" },
  acknowledged: { label: "Mark In Transit", value: "dispatched" },
  dispatched:   { label: "Mark Delivered", value: "delivered" },
};

function ShipmentProgress({ orderId, subpo, onUpdate }: { orderId: string; subpo: SubPO; onUpdate: () => void }) {
  const [updating, setUpdating] = useState(false);
  const currentIdx = STEPS.findIndex(s => s.key === subpo.status);
  const next = NEXT_STATUS[subpo.status];

  async function handleUpdate() {
    if (!next) return;
    setUpdating(true);
    await fetch(`/api/agent/orders/${orderId}/subpos/${subpo.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next.value }),
    });
    setUpdating(false);
    onUpdate();
  }

  return (
    <div className="mt-4">
      {/* Step bar */}
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                  style={done
                    ? { backgroundColor: "#0d2144", borderColor: "#0d2144", color: "#fff" }
                    : { backgroundColor: "#fff", borderColor: "#d1d5db", color: "#9ca3af" }
                  }
                >
                  {done && i < currentIdx ? "✓" : i + 1}
                </div>
                <span className="text-xs mt-1 font-medium" style={{ color: done ? "#0d2144" : "#9ca3af" }}>{step.label}</span>
              </div>
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 mb-4" style={{ backgroundColor: i < currentIdx ? "#0d2144" : "#e5e7eb" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Action button */}
      {next && (
        <div className="mt-3">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#1e4db7" }}
          >
            {updating ? "Updating…" : next.label}
          </button>
        </div>
      )}
      {subpo.status === "delivered" && (
        <p className="mt-2 text-xs text-emerald-600 font-medium">
          ✓ Delivered {subpo.delivered_at ? formatDate(subpo.delivered_at) : ""}
        </p>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/orders/${id}`);
      if (res.ok) setOrder(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!order) return <div className="text-center py-16 text-red-500">Order not found.</div>;

  const orderStatus = ORDER_STATUS[order.status] ?? { bg: "#f3f4f6", text: "#374151", label: order.status };

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={() => router.push("/agent/orders")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Procurement Log
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">ORD-{order.id.slice(0, 8).toUpperCase()}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: orderStatus.bg, color: orderStatus.text }}>
              {orderStatus.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Created {formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === "delivered" && !order.survey_submitted && (
            <button
              onClick={() => router.push(`/agent/surveys/new?order_id=${order.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#0d2144" }}
            >
              <Star className="h-4 w-4" /> Submit QA Survey
            </button>
          )}
          {order.status === "delivered" && order.survey_submitted && order.survey_id && (
            <button
              onClick={() => router.push(`/agent/surveys/${order.survey_id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Star className="h-4 w-4" /> View Survey
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Vendor Shipments */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">Vendor Shipments ({order.subpos.length})</h2>

          {order.subpos.map((subpo) => (
            <div key={subpo.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-900">PO-{subpo.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{subpo.supplier.country}</p>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(Number(subpo.total_amount))}</p>
              </div>

              <ShipmentProgress orderId={id} subpo={subpo} onUpdate={load} />

              {/* Line items */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-left pb-2 font-medium">Unit</th>
                      <th className="text-right pb-2 font-medium">Qty</th>
                      <th className="text-right pb-2 font-medium">Unit Price</th>
                      <th className="text-right pb-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subpo.line_items.map((li) => (
                      <tr key={li.id}>
                        <td className="py-1.5 font-medium text-gray-700">{li.product.name}</td>
                        <td className="py-1.5 text-gray-400">{li.product.unit}</td>
                        <td className="py-1.5 text-right text-gray-700">{Number(li.quantity).toLocaleString()}</td>
                        <td className="py-1.5 text-right text-gray-700">{formatCurrency(Number(li.unit_price))}</td>
                        <td className="py-1.5 text-right font-semibold text-gray-900">{formatCurrency(Number(li.unit_price) * Number(li.quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: "Revenue", value: formatCurrency(Number(order.total_amount)), bold: false },
                { label: "Cost", value: formatCurrency(Number(order.cost_amount)), bold: false },
                { label: "Margin", value: formatCurrency(Number(order.margin_amount)), green: true },
                { label: "Commission", value: order.commission ? formatCurrency(Number(order.commission.commission_earned)) : "—", bold: false },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-semibold ${row.green ? "text-emerald-600" : "text-gray-900"}`}>{row.value}</span>
                </div>
              ))}
              {order.commission && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-gray-500">{Number(order.commission.commission_rate)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Location */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> Delivery Location
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{order.buyer.company}</p>
              <p className="text-gray-500">{order.buyer.address ?? "No address provided"}</p>
            </div>
          </div>

          {/* Assigned Officer */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" /> Client Contact
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "#0d2144" }}>
                {order.buyer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{order.buyer.name}</p>
                <p className="text-xs text-gray-400">{order.buyer.email}</p>
              </div>
            </div>
            {order.rfq.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-600">{order.rfq.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
