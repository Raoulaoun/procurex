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

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/invoices")
      .then(r => r.ok ? r.json() : [])
      .then(d => setInvoices(Array.isArray(d) ? d : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Invoices</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-wide invoice overview</p>
      </div>
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : invoices.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No invoices yet</p>
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
              {invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">INV-{inv.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{inv.buyer.company}</div>
                  </TableCell>
                  <TableCell className="text-sm">{inv.order.agent.full_name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">ORD-{inv.order.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANTS[inv.status] ?? "secondary"}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(inv.amount))}</TableCell>
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
