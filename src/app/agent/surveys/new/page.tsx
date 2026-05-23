"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const CRITERIA = [
  { key: "delivery_score", label: "Delivery", description: "Was the order delivered on time and as arranged?" },
  { key: "quality_score", label: "Product Quality", description: "Did the products meet the expected quality standard?" },
  { key: "accuracy_score", label: "Order Accuracy", description: "Were all items correct, with no missing or wrong products?" },
  { key: "packaging_score", label: "Packaging", description: "Were products well-packaged and undamaged?" },
] as const;

const SCORE_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              (hovered || value) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 font-medium">
        {value > 0 ? SCORE_LABELS[value] : "—"}
      </span>
    </div>
  );
}

function SurveyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subpoId = searchParams.get("subpo_id") ?? "";
  const orderId = searchParams.get("order_id") ?? "";
  const supplierName = searchParams.get("supplier_name") ?? "";

  const [scores, setScores] = useState({ delivery_score: 0, quality_score: 0, accuracy_score: 0, packaging_score: 0 });
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const poRef = subpoId ? `PO-${subpoId.slice(0, 8).toUpperCase()}` : "";
  const orderRef = orderId ? `ORD-${orderId.slice(0, 8).toUpperCase()}` : "";

  const allScored = Object.values(scores).every((v) => v > 0);
  const overall = allScored
    ? (((scores.delivery_score + scores.quality_score + scores.accuracy_score + scores.packaging_score) / 4 / 5) * 10).toFixed(1)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allScored) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/agent/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subpo_id: subpoId, ...scores, comments: comments || null }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) router.push(`/agent/surveys/${data.id}`);
    else setError(data.error ?? "Failed to submit survey");
  }

  if (!subpoId) {
    return (
      <div className="text-center py-16 text-red-500">
        No shipment specified. Please navigate here from an order page.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <button
        type="button"
        onClick={() => orderId ? router.push(`/agent/orders/${orderId}`) : router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Order
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">QA Survey</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Rating for shipment{" "}
          <span className="font-mono font-medium text-gray-700">{poRef}</span>
          {supplierName && (
            <> · <span className="font-medium text-gray-700">{supplierName}</span></>
          )}
          {orderRef && (
            <> · Order <span className="font-mono font-medium text-gray-700">{orderRef}</span></>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">Rate 1 (poor) to 5 (excellent)</p>
      </div>

      <div className="space-y-3 mb-6">
        {CRITERIA.map(({ key, label, description }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="font-semibold text-gray-900 text-sm mb-1">{label}</p>
            <p className="text-xs text-gray-400 mb-3">{description}</p>
            <StarRating
              value={scores[key]}
              onChange={(v) => setScores((prev) => ({ ...prev, [key]: v }))}
            />
          </div>
        ))}
      </div>

      {overall && (
        <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: "#f0f4ff", border: "1px solid #c7d7ff" }}>
          <p className="text-sm font-medium text-blue-900">Calculated Overall Score</p>
          <p className="text-2xl font-bold" style={{ color: "#1e4db7" }}>{overall}<span className="text-sm font-normal text-blue-400">/10</span></p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Comments <span className="text-gray-400 font-normal">(optional)</span></p>
        <textarea
          placeholder="Any additional notes about this delivery…"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={!allScored || submitting}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
        style={{ backgroundColor: "#0d2144" }}
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Survey"}
      </button>
    </form>
  );
}

export default function NewSurveyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <SurveyForm />
    </Suspense>
  );
}
