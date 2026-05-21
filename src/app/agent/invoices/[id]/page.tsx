"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Send, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceLine {
  number: number; product_name: string; product_unit: string;
  quantity: number; unit_price: number; currency: string; line_total: number;
}
interface Invoice {
  id: string; status: string; amount: string; issued_at: string; due_at: string;
  buyer: { name: string; company: string; email: string; address: string | null };
  order: {
    id: string; total_amount: string; cost_amount: string; margin_amount: string;
    rfq: { id: string; notes: string | null };
    commission: { commission_earned: string; commission_rate: string; status: string } | null;
  };
  lines: InvoiceLine[];
}

const STATUS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "#f3f4f6", text: "#374151", label: "Draft" },
  sent:  { bg: "#dbeafe", text: "#1d4ed8", label: "Sent" },
  paid:  { bg: "#d1fae5", text: "#065f46", label: "Paid" },
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/agent/invoices/${id}`);
    if (res.ok) setInvoice(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusUpdate(newStatus: string) {
    setUpdating(true);
    await fetch(`/api/agent/invoices/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!invoice) return <div className="text-center py-16 text-red-500">Invoice not found.</div>;

  const statusInfo = STATUS[invoice.status] ?? { bg: "#f3f4f6", text: "#374151", label: invoice.status };
  const isOverdue = invoice.status === "sent" && new Date(invoice.due_at) < new Date();
  const nextAction = invoice.status === "draft"
    ? { label: "Send Invoice", value: "sent", icon: <Send className="h-4 w-4" /> }
    : invoice.status === "sent"
    ? { label: "Mark as Paid", value: "paid", icon: <CheckCircle className="h-4 w-4" /> }
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={() => router.push("/agent/invoices")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Invoices
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">INV-{invoice.id.slice(0, 8).toUpperCase()}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}>
              {statusInfo.label}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Overdue
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Order: <span className="font-mono">ORD-{invoice.order.id.slice(0, 8).toUpperCase()}</span>
            {" · "}Issued {formatDate(invoice.issued_at)}
            {" · "}Due {formatDate(invoice.due_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open(`/api/agent/invoices/${id}/pdf`, "_blank")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
          {nextAction && (
            <button
              onClick={() => handleStatusUpdate(nextAction.value)}
              disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#0d2144" }}
            >
              {updating ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <>{nextAction.icon} {nextAction.label}</>}
            </button>
          )}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.lines.map((line) => (
                  <tr key={line.number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{line.number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{line.product_name}</td>
                    <td className="px-4 py-3 text-gray-500">{line.product_unit}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{line.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(line.unit_price, line.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(line.line_total, line.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Due</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(Number(invoice.amount))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Financials */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Financials</h3>
            <div className="space-y-2.5">
              {[
                { label: "Revenue", value: formatCurrency(Number(invoice.order.total_amount)) },
                { label: "Cost", value: formatCurrency(Number(invoice.order.cost_amount)) },
                { label: "Margin", value: formatCurrency(Number(invoice.order.margin_amount)), green: true },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-semibold ${row.green ? "text-emerald-600" : "text-gray-900"}`}>{row.value}</span>
                </div>
              ))}
              {invoice.order.commission && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                  <span>Commission ({invoice.order.commission.commission_rate}%)</span>
                  <span>{formatCurrency(Number(invoice.order.commission.commission_earned))}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Bill To</h3>
            <p className="font-semibold text-gray-900 text-sm">{invoice.buyer.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{invoice.buyer.company}</p>
            <p className="text-xs text-gray-400 mt-0.5">{invoice.buyer.email}</p>
            {invoice.buyer.address && <p className="text-xs text-gray-400 mt-0.5">{invoice.buyer.address}</p>}
          </div>

          {/* Notes */}
          {invoice.order.rfq.notes && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.order.rfq.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
