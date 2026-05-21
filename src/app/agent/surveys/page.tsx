"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Survey {
  id: string;
  overall_score: string;
  delivery_score: number;
  quality_score: number;
  accuracy_score: number;
  packaging_score: number;
  submitted_at: string;
  order: { id: string };
  buyer: { name: string; company: string };
}

function ScorePill({ score, outOf = 5 }: { score: number; outOf?: number }) {
  const pct = score / outOf;
  const bg = pct >= 0.8 ? "#d1fae5" : pct >= 0.6 ? "#fef3c7" : "#fee2e2";
  const text = pct >= 0.8 ? "#065f46" : pct >= 0.6 ? "#b45309" : "#b91c1c";
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ backgroundColor: bg, color: text }}>
      {score}/{outOf}
    </span>
  );
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/surveys")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setSurveys(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">QA Surveys</h1>
        <p className="text-sm text-gray-500 mt-0.5">Post-delivery quality assessments — scores update supplier ratings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center py-16 text-center">
          <p className="font-medium text-gray-700 mb-1">No surveys yet</p>
          <p className="text-sm text-gray-400">Submit a survey after an order is fully delivered.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quality</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Accuracy</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Packaging</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {surveys.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                    ORD-{s.order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.buyer.name}</p>
                    <p className="text-xs text-gray-400">{s.buyer.company}</p>
                  </td>
                  <td className="px-4 py-3 text-center"><ScorePill score={s.delivery_score} /></td>
                  <td className="px-4 py-3 text-center"><ScorePill score={s.quality_score} /></td>
                  <td className="px-4 py-3 text-center"><ScorePill score={s.accuracy_score} /></td>
                  <td className="px-4 py-3 text-center"><ScorePill score={s.packaging_score} /></td>
                  <td className="px-4 py-3 text-center"><ScorePill score={Number(Number(s.overall_score).toFixed(1))} outOf={10} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(s.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/agent/surveys/${s.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                      View
                    </Link>
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
