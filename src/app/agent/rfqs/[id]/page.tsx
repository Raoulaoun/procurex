"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, ShoppingCart, Loader2, Mail, Phone } from "lucide-react";
import { formatCurrency, formatDate, qualityTierLabel } from "@/lib/utils";

interface LineItem {
  id: string; quantity: string; buyer_unit_price: string | null; margin_pct: string | null;
  product: { name: string; name_ar: string; unit: string; subcategory: { name: string; category: { name: string } } };
  selected_supplier_product: { quality_tier: string; currency: string; lead_time_days: number } | null;
}
interface RFQ {
  id: string; status: string; notes: string | null; created_at: string;
  buyer: { name: string; company: string; email: string; address: string | null };
  line_items: LineItem[];
}

const STATUS: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: "#f3f4f6", text: "#374151", label: "Draft" },
  sent:      { bg: "#fef3c7", text: "#b45309", label: "Sent" },
  confirmed: { bg: "#d1fae5", text: "#065f46", label: "Agent-Confirmed" },
  cancelled: { bg: "#fee2e2", text: "#b91c1c", label: "Cancelled" },
};

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetch(`/api/agent/rfqs/${id}`)
      .then(r => r.json())
      .then(data => { setRfq(data); setLoading(false); });
  }, [id]);

  async function handleConvertToOrder() {
    if (!confirm("Convert this quotation to an order? This will send purchase orders to all suppliers.")) return;
    setConverting(true);
    const res = await fetch(`/api/agent/rfqs/${id}/convert`, { method: "POST" });
    const data = await res.json();
    setConverting(false);
    if (res.ok) router.push(`/agent/orders/${data.order_id}`);
    else alert(data.error ?? "Failed to convert");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!rfq) return <div className="text-center py-16 text-red-500">Quote not found.</div>;

  const total = rfq.line_items.reduce((s, li) =>
    s + (Number(li.buyer_unit_price ?? 0) * Number(li.quantity)), 0
  );
  const currency = rfq.line_items[0]?.selected_supplier_product?.currency ?? "USD";
  const statusInfo = STATUS[rfq.status] ?? { bg: "#f3f4f6", text: "#374151", label: rfq.status };

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={() => router.push("/agent/rfqs")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Quotes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">QUO-{rfq.id.slice(0, 8).toUpperCase()}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Created {formatDate(rfq.created_at)}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Line items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rfq.line_items.map((li, i) => {
                  const unitPrice = Number(li.buyer_unit_price ?? 0);
                  const qty = Number(li.quantity);
                  return (
                    <tr key={li.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{li.product.name}</p>
                        <p className="text-xs text-gray-400">{li.product.subcategory.category.name} / {li.product.subcategory.name}</p>
                        {li.product.name_ar && <p className="text-xs text-gray-400" dir="rtl">{li.product.name_ar}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {li.selected_supplier_product ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {qualityTierLabel(li.selected_supplier_product.quality_tier)}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{li.product.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {li.buyer_unit_price ? formatCurrency(unitPrice, currency) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {li.buyer_unit_price ? formatCurrency(unitPrice * qty, currency) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total row */}
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(total, currency)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {rfq.notes && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-gray-600">{rfq.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Next Steps */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-2">
              {rfq.status === "sent" && (
                <button
                  onClick={handleConvertToOrder}
                  disabled={converting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#0d2144" }}
                >
                  {converting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
                    : <><ShoppingCart className="h-4 w-4" /> Convert to Order</>
                  }
                </button>
              )}
              {(rfq.status === "sent" || rfq.status === "confirmed") && (
                <button
                  onClick={() => window.open(`/api/agent/rfqs/${id}/pdf`, "_blank")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              )}
              {rfq.status === "draft" && (
                <div className="text-xs text-gray-400 text-center py-2">
                  This quote is in draft mode.
                </div>
              )}
              {rfq.status === "confirmed" && (
                <div className="text-xs text-emerald-600 text-center py-2 font-medium">
                  ✓ Quote confirmed and converted to order
                </div>
              )}
            </div>
          </div>

          {/* Client Contact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Client Contact</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "#0d2144" }}>
                {rfq.buyer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{rfq.buyer.name}</p>
                <p className="text-xs text-gray-400">{rfq.buyer.company}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <a href={`mailto:${rfq.buyer.email}`} className="hover:text-blue-600 transition-colors">{rfq.buyer.email}</a>
              </div>
              {rfq.buyer.address && (
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <span>{rfq.buyer.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
