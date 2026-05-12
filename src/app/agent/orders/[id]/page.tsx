"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, Truck, Package, ClipboardCheck, PackageCheck, Star } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SubPOLine { id: string; quantity: string; unit_price: string; product: { name: string; unit: string } }
interface SubPO {
  id: string; status: string; total_amount: string; sent_at: string | null;
  acknowledged_at: string | null; dispatched_at: string | null; delivered_at: string | null;
  supplier: { id: string; name: string; country: string };
  line_items: SubPOLine[];
}
interface Order {
  id: string; status: string; total_amount: string; cost_amount: string;
  margin_amount: string; created_at: string;
  buyer: { name: string; company: string; email: string; address: string | null };
  rfq: { id: string; notes: string | null };
  subpos: SubPO[];
  commission: { commission_earned: string; commission_rate: string; status: string } | null;
  survey_submitted: boolean;
  survey_id: string | null;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed", processing: "Processing",
  partially_delivered: "Partially Delivered", delivered: "Delivered",
};
const ORDER_STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success"> = {
  confirmed: "secondary", processing: "warning",
  partially_delivered: "warning", delivered: "success",
};

const SUBPO_STEPS = [
  { key: "sent", label: "Sent", icon: Package },
  { key: "acknowledged", label: "Acknowledged", icon: ClipboardCheck },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  sent: { label: "Mark Acknowledged", value: "acknowledged" },
  acknowledged: { label: "Mark Dispatched", value: "dispatched" },
  dispatched: { label: "Mark Delivered", value: "delivered" },
};

function SubPOTimeline({ orderId, subpo, onStatusUpdate }: { orderId: string; subpo: SubPO; onStatusUpdate: () => void }) {
  const [updating, setUpdating] = useState(false);
  const currentIdx = SUBPO_STEPS.findIndex(s => s.key === subpo.status);
  const next = NEXT_STATUS[subpo.status];

  async function handleUpdate() {
    if (!next) return;
    setUpdating(true);
    await fetch(`/api/agent/orders/${orderId}/subpos/${subpo.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next.value }),
    });
    setUpdating(false);
    onStatusUpdate();
  }

  return (
    <div className="flex items-center gap-1 mt-3">
      {SUBPO_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors",
              done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-3 w-3" />
              {step.label}
            </div>
            {i < SUBPO_STEPS.length - 1 && (
              <div className={cn("h-px w-4 mx-0.5", done && i < currentIdx ? "bg-primary/40" : "bg-border")} />
            )}
          </div>
        );
      })}
      {next && (
        <Button size="sm" variant="outline" className="ml-3 h-7 text-xs" onClick={handleUpdate} disabled={updating}>
          {updating ? "Updating…" : next.label}
        </Button>
      )}
      {subpo.status === "delivered" && (
        <span className="ml-3 text-xs text-green-600 flex items-center gap-1 font-medium">
          <Check className="h-3.5 w-3.5" /> Delivered {subpo.delivered_at ? formatDate(subpo.delivered_at) : ""}
        </span>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/orders/${id}`);
      if (res.ok) setOrder(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>;
  if (!order) return <div className="text-center py-16 text-destructive">Order not found.</div>;

  const currency = "USD";

  return (
    <div>
      <button onClick={() => router.push("/agent/orders")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">ORD-{order.id.slice(0, 8).toUpperCase()}</h1>
            <Badge variant={ORDER_STATUS_VARIANTS[order.status] ?? "secondary"}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Created {formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === "delivered" && !order.survey_submitted && (
            <Button size="sm" onClick={() => router.push(`/agent/surveys/new?order_id=${order.id}`)}>
              <Star className="h-4 w-4 mr-1.5" /> Submit QA Survey
            </Button>
          )}
          {order.status === "delivered" && order.survey_submitted && order.survey_id && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/agent/surveys/${order.survey_id}`)}>
              <Star className="h-4 w-4 mr-1.5" /> View Survey
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: formatCurrency(Number(order.total_amount), currency), highlight: false },
          { label: "Total Cost", value: formatCurrency(Number(order.cost_amount), currency), highlight: false },
          { label: "Margin", value: formatCurrency(Number(order.margin_amount), currency), highlight: true },
          { label: "Commission", value: order.commission ? formatCurrency(Number(order.commission.commission_earned), currency) : "—", highlight: false },
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
      <Card className="mb-6">
        <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground tracking-wide">Buyer</CardTitle></CardHeader>
        <CardContent className="flex gap-6">
          <div>
            <p className="font-semibold">{order.buyer.name}</p>
            <p className="text-sm text-muted-foreground">{order.buyer.company}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{order.buyer.email}</p>
            {order.buyer.address && <p className="text-sm text-muted-foreground">{order.buyer.address}</p>}
          </div>
          {order.rfq.notes && (
            <div className="ml-auto max-w-sm">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{order.rfq.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      {/* SubPOs */}
      <h2 className="font-semibold mb-4">Purchase Orders ({order.subpos.length})</h2>
      <div className="space-y-4">
        {order.subpos.map((subpo) => (
          <Card key={subpo.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">PO-{subpo.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground">· {subpo.supplier.name} ({subpo.supplier.country})</span>
                  </div>
                  <SubPOTimeline
                    orderId={id}
                    subpo={subpo}
                    onStatusUpdate={load}
                  />
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(Number(subpo.total_amount), currency)}</p>
                  <p className="text-xs text-muted-foreground">Cost to supplier</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subpo.line_items.map((li) => (
                    <TableRow key={li.id}>
                      <TableCell className="font-medium">{li.product.name}</TableCell>
                      <TableCell>{li.product.unit}</TableCell>
                      <TableCell className="text-right">{Number(li.quantity).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(li.unit_price), currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(li.unit_price) * Number(li.quantity), currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
