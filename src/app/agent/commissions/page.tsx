"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Commission {
  id: string; status: string;
  margin_amount: string; commission_rate: string; commission_earned: string;
  created_at: string; paid_at: string | null;
  order: { id: string; status: string; created_at: string; buyer: { name: string; company: string } };
}

interface Data {
  commissions: Commission[];
  totals: { total_earned: number; total_pending: number; total_paid: number };
}

export default function CommissionsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/commissions")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your earnings from confirmed orders</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : !data ? null : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(data.totals.total_earned)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Pending Payout</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(data.totals.total_pending)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Paid Out</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totals.total_paid)}</p>
              </CardContent>
            </Card>
          </div>

          {data.commissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center">
                <DollarSign className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium mb-1">No commissions yet</p>
                <p className="text-sm text-muted-foreground">Commissions are generated when orders are confirmed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        ORD-{c.order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{c.order.buyer.name}</div>
                        <div className="text-xs text-muted-foreground">{c.order.buyer.company}</div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(c.margin_amount))}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{Number(c.commission_rate)}%</TableCell>
                      <TableCell className={cn("text-right font-bold", c.status === "paid" ? "text-green-600" : "text-amber-600")}>
                        {formatCurrency(Number(c.commission_earned))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === "paid" ? "success" : "warning"}>
                          {c.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.paid_at ? formatDate(c.paid_at) : "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/agent/orders/${c.order.id}`}>Order</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
