"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { CRUDModal } from "@/components/admin/crud-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Pencil, Trash2, ChevronRight, Star, Loader2 } from "lucide-react";

interface Supplier {
  id: string; name: string; email: string; phone: string | null; country: string;
  status: string; quality_score: number; created_at: string;
  _count: { supplier_products: number };
}

const empty = { name: "", email: "", phone: "", country: "" };

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    active: "success", inactive: "secondary", suspended: "destructive",
  };
  return <Badge variant={variants[status] ?? "secondary"}>{status}</Badge>;
}

function QualityBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "bg-emerald-500" : score >= 5 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium">{Number(score).toFixed(1)}</span>
    </div>
  );
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Supplier | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty);
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/suppliers");
    const data = res.ok ? await res.json() : [];
    setSuppliers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm(empty); setEditStatus("active"); setModal({ open: true, editing: null }); }
  function openEdit(s: Supplier) {
    setForm({ name: s.name, email: s.email, phone: s.phone ?? "", country: s.country });
    setEditStatus(s.status);
    setModal({ open: true, editing: s });
  }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    setSaving(true);
    const { editing } = modal;
    const url = editing ? `/api/admin/suppliers/${editing.id}` : "/api/admin/suppliers";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, status: editStatus }) });
    setSaving(false);
    closeModal();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier? All their product prices will be removed.")) return;
    await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader title="Suppliers" description="Manage suppliers and their product catalogues" onAdd={openAdd} addLabel="Add Supplier" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Truck} title="No suppliers yet" description="Add suppliers to start building price catalogues." onAdd={openAdd} addLabel="Add Supplier" />
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Supplier</TableHead>
                <TableHead className="font-semibold">Country</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Quality Score</TableHead>
                <TableHead className="font-semibold">Products</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600">
                      {s.country}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell><QualityBar score={s.quality_score} /></TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {s._count.supplier_products} products
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={() => router.push(`/admin/catalogue/suppliers/${s.id}`)}>
                        Prices <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CRUDModal open={modal.open} onClose={closeModal} title={modal.editing ? "Edit Supplier" : "Add Supplier"} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <div>
            <Label>Supplier Name</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chem Co. Ltd" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="orders@supplier.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Country</Label>
              <Input className="mt-1" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. China" />
            </div>
            {modal.editing && (
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CRUDModal>
    </div>
  );
}
