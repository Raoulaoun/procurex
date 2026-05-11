"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RFQ {
  id: string; status: string; notes: string | null; created_at: string;
  buyer: { id: string; name: string; company: string };
  _count: { line_items: number };
}

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  draft: "secondary", sent: "warning", confirmed: "success", cancelled: "destructive",
};

export default function RFQListPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/agent/rfqs");
    if (res.ok) setRfqs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft RFQ?")) return;
    await fetch(`/api/agent/rfqs/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My RFQs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Quotations you have created for buyers</p>
        </div>
        <Button asChild size="sm">
          <Link href="/agent/rfqs/new"><Plus className="h-4 w-4 mr-1.5" /> New RFQ</Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : rfqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium mb-1">No RFQs yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first quotation for a buyer.</p>
            <Button asChild size="sm"><Link href="/agent/rfqs/new"><Plus className="h-4 w-4 mr-1.5" /> New RFQ</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    QUO-{rfq.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{rfq.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{rfq.buyer.company}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[rfq.status] ?? "secondary"}>{rfq.status}</Badge>
                  </TableCell>
                  <TableCell>{rfq._count.line_items} product{rfq._count.line_items !== 1 ? "s" : ""}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(rfq.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/agent/rfqs/${rfq.id}`}>View</Link>
                      </Button>
                      {rfq.status === "draft" && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => handleDelete(rfq.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
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
