"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardCheck } from "lucide-react";
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

function ScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 4 ? "success" : score >= 3 ? "warning" : "destructive";
  return <Badge variant={variant}>{score}/5</Badge>;
}

function OverallBadge({ score }: { score: string }) {
  const n = Number(score);
  const variant = n >= 7 ? "success" : n >= 5 ? "warning" : "destructive";
  return <Badge variant={variant}>{n.toFixed(1)}/10</Badge>;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/surveys")
      .then(r => r.json())
      .then(data => { setSurveys(data); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">QA Surveys</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Post-delivery quality assessments — scores update supplier ratings</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ClipboardCheck className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium mb-1">No surveys yet</p>
            <p className="text-sm text-muted-foreground">Submit a survey after an order is fully delivered.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-center">Delivery</TableHead>
                <TableHead className="text-center">Quality</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
                <TableHead className="text-center">Packaging</TableHead>
                <TableHead className="text-center">Overall</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    ORD-{s.order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{s.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{s.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-center"><ScoreBadge score={s.delivery_score} /></TableCell>
                  <TableCell className="text-center"><ScoreBadge score={s.quality_score} /></TableCell>
                  <TableCell className="text-center"><ScoreBadge score={s.accuracy_score} /></TableCell>
                  <TableCell className="text-center"><ScoreBadge score={s.packaging_score} /></TableCell>
                  <TableCell className="text-center"><OverallBadge score={s.overall_score} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(s.submitted_at)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/agent/surveys/${s.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
