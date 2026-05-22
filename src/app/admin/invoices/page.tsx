"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CheckCircle2, Clock, FileText, Loader2 } from "lucide-react";
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
type Tab = typeof TABS[number];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

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

  const summaryCards = [
    { label: "Total Billed", value: formatCurrency(totalBilled), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Collected", value: formatCurrency(totalPaid), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Outstanding", value: formatCurrency(totalPending), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Invoices", value: String(invoices.length), icon: FileText, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <div>
      <div className="mb-7 pb-5 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">All Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide invoice overview</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-0 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{c.label}</p>
                    <p className="text-xl font-bold">{c.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-muted/60 p-1 rounded-lg w-fit">
        {TABS.map(t => {
          const count = t === "all" ? invoices.length : invoices.filter(i => i.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize"
              style={tab === t
                ? { backgroundColor: "#0d2144", color: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
                : { color: "#6b7280" }}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No invoices found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Reference</TableHead>
                <TableHead className="font-semibold">Buyer</TableHead>
                <TableHead className="font-semibold">Agent</TableHead>
                <TableHead className="font-semibold">Order</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Issued</TableHead>
                <TableHead className="font-semibold">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                    INV-{inv.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{inv.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{inv.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.order.agent.full_name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    ORD-{inv.order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[inv.status] ?? "secondary"}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">{formatCurrency(Number(inv.amount))}</TableCell>
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
