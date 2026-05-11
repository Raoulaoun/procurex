"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Send, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success"> = {
  draft: "secondary", sent: "warning", paid: "success",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", sent: "Sent", paid: "Paid",
};

const NEXT_ACTION: Record<string, { label: string; value: string; icon: React.ReactNode }> = {
  draft: { label: "Send Invoice", value: "sent", icon: <Send className="h-4 w-4 mr-1.5" /> },
  sent: { label: "Mark as Paid", value: "paid", icon: <CheckCircle className="h-4 w-4 mr-1.5" /> },
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

  if (loading) return <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>;
  if (!invoice) return <div className="text-center py-16 text-destructive">Invoice not found.</div>;

  const nextAction = NEXT_ACTION[invoice.status];
  const isOverdue = invoice.status === "sent" && new Date(invoice.due_at) < new Date();

  return (
    <div>
      <button onClick={() => router.push("/agent/invoices")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Invoices
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">INV-{invoice.id.slice(0, 8).toUpperCase()}</h1>
            <Badge variant={STATUS_VARIANTS[invoice.status] ?? "secondary"}>
              {STATUS_LABELS[invoice.status] ?? invoice.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">Overdue</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Order: <span className="font-mono">ORD-{invoice.order.id.slice(0, 8).toUpperCase()}</span>
            {" · "}Issued {formatDate(invoice.issued_at)}
            {" · "}Due {formatDate(invoice.due_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/api/agent/invoices/${id}/pdf`, "_blank")}>
            <Download className="h-4 w-4 mr-1.5" /> Download PDF
          </Button>
          {nextAction && (
            <Button size="sm" onClick={() => handleStatusUpdate(nextAction.value)} disabled={updating}>
              {updating ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Updating…</> : <>{nextAction.icon}{nextAction.label}</>}
            </Button>
          )}
        </div>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Invoice Total", value: formatCurrency(Number(invoice.order.total_amount)), highlight: false },
          { label: "Cost", value: formatCurrency(Number(invoice.order.cost_amount)), highlight: false },
          { label: "Margin", value: formatCurrency(Number(invoice.order.margin_amount)), highlight: true },
          { label: "Commission", value: invoice.order.commission ? formatCurrency(Number(invoice.order.commission.commission_earned)) : "—", highlight: false },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={cn("text-xl font-bold mt-0.5", card.highlight && "text-green-600")}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Buyer */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">Bill To</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{invoice.buyer.name}</p>
            <p className="text-sm text-muted-foreground">{invoice.buyer.company}</p>
            <p className="text-sm text-muted-foreground">{invoice.buyer.email}</p>
            {invoice.buyer.address && <p className="text-sm text-muted-foreground">{invoice.buyer.address}</p>}
          </CardContent>
        </Card>
        {invoice.order.rfq.notes && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{invoice.order.rfq.notes}</p></CardContent>
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
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lines.map((line) => (
              <TableRow key={line.number}>
                <TableCell className="text-muted-foreground">{line.number}</TableCell>
                <TableCell className="font-medium">{line.product_name}</TableCell>
                <TableCell>{line.product_unit}</TableCell>
                <TableCell className="text-right">{line.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatCurrency(line.unit_price, line.currency)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(line.line_total, line.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="w-56 space-y-2">
          <Separator />
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total Due</span>
            <span>{formatCurrency(Number(invoice.amount))}</span>
          </div>
          {invoice.order.commission && (
            <p className="text-xs text-muted-foreground text-right">
              Commission ({invoice.order.commission.commission_rate}%): {formatCurrency(Number(invoice.order.commission.commission_earned))}
              {" · "}<span className={invoice.order.commission.status === "paid" ? "text-green-600" : ""}>{invoice.order.commission.status}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
