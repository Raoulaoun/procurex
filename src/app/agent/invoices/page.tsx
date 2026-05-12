"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; status: string; amount: string; issued_at: string; due_at: string;
  buyer: { name: string; company: string };
  order: { id: string };
}

const STATUS_VARIANTS: Record<string, "secondary" | "warning" | "success"> = {
  draft: "secondary", sent: "warning", paid: "success",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", sent: "Sent", paid: "Paid",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/invoices")
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and send invoices to buyers</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium mb-1">No invoices yet</p>
            <p className="text-sm text-muted-foreground">Invoices are auto-generated when an order is confirmed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    INV-{inv.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{inv.buyer.company}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    ORD-{inv.order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[inv.status] ?? "secondary"}>
                      {STATUS_LABELS[inv.status] ?? inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(inv.amount))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issued_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.due_at)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/agent/invoices/${inv.id}`}>View</Link>
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
