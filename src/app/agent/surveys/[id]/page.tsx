"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("h-5 w-5", s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
      <span className="ml-1.5 text-sm text-muted-foreground">{value}/5</span>
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
      .then(r => r.json())
      .then(data => { setSurvey(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>;
  if (!survey) return <div className="text-center py-16 text-destructive">Survey not found.</div>;

  const overall = Number(survey.overall_score);
  const overallVariant = overall >= 7 ? "success" : overall >= 5 ? "warning" : "destructive";

  return (
    <div>
      <button onClick={() => router.push("/agent/surveys")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Surveys
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">QA-{survey.id.slice(0, 8).toUpperCase()}</h1>
            <Badge variant={overallVariant}>{overall.toFixed(1)}/10</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Order <span className="font-mono">ORD-{survey.order.id.slice(0, 8).toUpperCase()}</span>
            {" · "}{survey.buyer.name} ({survey.buyer.company})
            {" · "}Submitted {formatDate(survey.submitted_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {CRITERIA.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <StarDisplay value={survey[key]} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Overall Score</p>
          <p className="text-3xl font-bold text-primary">{overall.toFixed(1)}<span className="text-sm text-muted-foreground font-normal">/10</span></p>
        </CardContent>
      </Card>

      {survey.comments && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">Comments</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{survey.comments}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
