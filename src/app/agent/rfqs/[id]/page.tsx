"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Star } from "lucide-react";
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

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  draft: "secondary", sent: "warning", confirmed: "success", cancelled: "destructive",
};

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agent/rfqs/${id}`)
      .then(r => r.json())
      .then(data => { setRfq(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>;
  if (!rfq) return <div className="text-center py-16 text-destructive">RFQ not found.</div>;

  const total = rfq.line_items.reduce((s, li) =>
    s + (Number(li.buyer_unit_price ?? 0) * Number(li.quantity)), 0
  );

  return (
    <div>
      <button onClick={() => router.push("/agent/rfqs")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to RFQs
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">QUO-{rfq.id.slice(0, 8).toUpperCase()}</h1>
            <Badge variant={STATUS_VARIANTS[rfq.status] ?? "secondary"}>{rfq.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Created {formatDate(rfq.created_at)}</p>
        </div>
        {(rfq.status === "sent" || rfq.status === "confirmed") && (
          <Button variant="outline" size="sm" onClick={() => window.open(`/api/agent/rfqs/${id}/pdf`, "_blank")}>
            <Download className="h-4 w-4 mr-1.5" /> Download PDF
          </Button>
        )}
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">Buyer</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{rfq.buyer.name}</p>
            <p className="text-sm text-muted-foreground">{rfq.buyer.company}</p>
            <p className="text-sm text-muted-foreground">{rfq.buyer.email}</p>
            {rfq.buyer.address && <p className="text-sm text-muted-foreground">{rfq.buyer.address}</p>}
          </CardContent>
        </Card>
        {rfq.notes && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{rfq.notes}</p></CardContent>
          </Card>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Line items */}
      <h2 className="font-semibold mb-3">Line Items</h2>
      <div className="rounded-lg border overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfq.line_items.map((li, i) => {
              const unitPrice = Number(li.buyer_unit_price ?? 0);
              const qty = Number(li.quantity);
              const lineTotal = unitPrice * qty;
              const currency = li.selected_supplier_product?.currency ?? "USD";
              return (
                <TableRow key={li.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{li.product.name}</div>
                    {li.product.name_ar && <div className="text-xs text-muted-foreground" dir="rtl">{li.product.name_ar}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{li.product.subcategory.category.name} / {li.product.subcategory.name}</TableCell>
                  <TableCell>
                    {li.selected_supplier_product ? (
                      <Badge variant="outline">{qualityTierLabel(li.selected_supplier_product.quality_tier)}</Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>{li.product.unit}</TableCell>
                  <TableCell className="text-right">{qty.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{li.buyer_unit_price ? formatCurrency(unitPrice, currency) : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{li.buyer_unit_price ? formatCurrency(lineTotal, currency) : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="w-56 space-y-2">
          <Separator />
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total</span>
            <span>{formatCurrency(total, rfq.line_items[0]?.selected_supplier_product?.currency ?? "USD")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
