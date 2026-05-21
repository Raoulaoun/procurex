"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Survey {
  id: string;
  overall_score: string;
  delivery_score: number;
  quality_score: number;
  accuracy_score: number;
  packaging_score: number;
  comments: string | null;
  submitted_at: string;
  order: { id: string };
  buyer: { name: string; company: string };
}

const CRITERIA = [
  { key: "delivery_score" as const, label: "Delivery" },
  { key: "quality_score" as const, label: "Product Quality" },
  { key: "accuracy_score" as const, label: "Order Accuracy" },
  { key: "packaging_score" as const, label: "Packaging" },
];

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("h-5 w-5", s <= value ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-700">{value}/5</span>
    </div>
  );
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agent/surveys/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setSurvey(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!survey) return <div className="text-center py-16 text-red-500">Survey not found.</div>;

  const overall = Number(survey.overall_score);
  const overallBg = overall >= 7 ? "#d1fae5" : overall >= 5 ? "#fef3c7" : "#fee2e2";
  const overallText = overall >= 7 ? "#065f46" : overall >= 5 ? "#b45309" : "#b91c1c";

  return (
    <div>
      <button onClick={() => router.push("/agent/surveys")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> QA Surveys
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">QA-{survey.id.slice(0, 8).toUpperCase()}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold"
              style={{ backgroundColor: overallBg, color: overallText }}>
              {overall.toFixed(1)}/10
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Order <span className="font-mono">ORD-{survey.order.id.slice(0, 8).toUpperCase()}</span>
            {" · "}{survey.buyer.name} ({survey.buyer.company})
            {" · "}Submitted {formatDate(survey.submitted_at)}
          </p>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {CRITERIA.map(({ key, label }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{label}</p>
            <StarDisplay value={survey[key]} />
          </div>
        ))}
      </div>

      {/* Overall */}
      <div className="rounded-xl p-5 mb-4 flex items-center justify-between" style={{ backgroundColor: overallBg, border: `1px solid ${overallText}30` }}>
        <p className="text-sm font-semibold" style={{ color: overallText }}>Overall Score</p>
        <p className="text-3xl font-bold" style={{ color: overallText }}>
          {overall.toFixed(1)}<span className="text-sm font-normal opacity-60">/10</span>
        </p>
      </div>

      {/* Comments */}
      {survey.comments && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Comments</p>
          <p className="text-sm text-gray-600">{survey.comments}</p>
        </div>
      )}
    </div>
  );
}
