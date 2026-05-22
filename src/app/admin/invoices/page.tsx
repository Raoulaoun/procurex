"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; status: string; amount: string; issued_at: string; due_at: string;
  buyer: { name: string; company: string };
  order: { id: string; agent: { full_name: string } };
}

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success"> = {
  draft: "secondary", sent: "warning", paid: "success",
};
const TABS = ["all", "draft", "sent", "paid"] as const;

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof TABS[number]>("all");

  useEffect(() => {
    fetch("/api/admin/invoices")
      .then(r => r.ok ? r.json() : [])
      .then(d => setInvoices(Array.isArray(d) ? d : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? invoices : invoices.filter(i => i.status === tab);
  const totalBilled  = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === "sent").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Invoices</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-wide invoice overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Total Invoices</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-muted p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize"
            style={tab === t ? { backgroundColor: "#0d2144", color: "#fff" } : { color: "#6b7280" }}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)} ({t === "all" ? invoices.length : invoices.filter(i => i.status === t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No invoices found</p>
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">INV-{inv.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{inv.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{inv.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-sm">{inv.order.agent.full_name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">ORD-{inv.order.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[inv.status] ?? "secondary"}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">{formatCurrency(Number(inv.amount))}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issued_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.due_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
