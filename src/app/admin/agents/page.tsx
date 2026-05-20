"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Agent {
  id: string; full_name: string; email: string; commission_rate: string; status: string;
  _count: { orders: number; commissions: number };
  commissions: { commission_earned: string; status: string }[];
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/agents")
      .then(r => r.ok ? r.json() : [])
      .then(d => setAgents(Array.isArray(d) ? d : []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage procurement agents and their commissions</p>
      </div>
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : agents.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No agents yet</p>
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Earned</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map(a => {
                const totalEarned = a.commissions.reduce((s, c) => s + Number(c.commission_earned), 0);
                const pending = a.commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.commission_earned), 0);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.email}</TableCell>
                    <TableCell className="text-center">{Number(a.commission_rate)}%</TableCell>
                    <TableCell className="text-center">{a._count.orders}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">{formatCurrency(totalEarned)}</TableCell>
                    <TableCell className="text-right text-amber-600">{pending > 0 ? formatCurrency(pending) : "—"}</TableCell>
                    <TableCell><Badge variant={a.status === "active" ? "success" : "secondary"}>{a.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
