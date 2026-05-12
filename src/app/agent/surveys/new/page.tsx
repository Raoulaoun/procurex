"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const CRITERIA = [
  { key: "delivery_score", label: "Delivery", description: "Was the order delivered on time and as arranged?" },
  { key: "quality_score", label: "Product Quality", description: "Did the products meet the expected quality standard?" },
  { key: "accuracy_score", label: "Order Accuracy", description: "Were all items correct, with no missing or wrong products?" },
  { key: "packaging_score", label: "Packaging", description: "Were products well-packaged and undamaged?" },
] as const;

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-colors"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              (hovered || value) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground self-center">
        {value > 0 ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value] : "—"}
      </span>
    </div>
  );
}

function SurveyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? "";

  const [scores, setScores] = useState({ delivery_score: 0, quality_score: 0, accuracy_score: 0, packaging_score: 0 });
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderRef, setOrderRef] = useState("");

  useEffect(() => {
    if (orderId) setOrderRef(`ORD-${orderId.slice(0, 8).toUpperCase()}`);
  }, [orderId]);

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
      body: JSON.stringify({ order_id: orderId, ...scores, comments: comments || null }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      router.push(`/agent/surveys/${data.id}`);
    } else {
      setError(data.error ?? "Failed to submit survey");
    }
  }

  if (!orderId) {
    return (
      <div className="text-center py-16 text-destructive">
        No order specified. Please navigate here from an order page.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">QA Survey</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Order <span className="font-mono font-medium">{orderRef}</span> — Rate 1 (poor) to 5 (excellent)
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {CRITERIA.map(({ key, label, description }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{label}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent>
              <StarRating
                value={scores[key]}
                onChange={(v) => setScores((prev) => ({ ...prev, [key]: v }))}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall preview */}
      {overall && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Calculated Overall Score</p>
            <p className="text-2xl font-bold text-primary">{overall}<span className="text-sm text-muted-foreground">/10</span></p>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Comments <span className="text-muted-foreground font-normal">(optional)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional notes about this delivery or the suppliers…"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <Button type="submit" disabled={!allScored || submitting} className="w-full sm:w-auto">
        {submitting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Submitting…</> : "Submit Survey"}
      </Button>
    </form>
  );
}

export default function NewSurveyPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>}>
      <SurveyForm />
    </Suspense>
  );
}
