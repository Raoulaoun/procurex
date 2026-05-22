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
import { Truck, Pencil, Trash2, ChevronRight, Star } from "lucide-react";

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
    await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: editStatus }),
    });
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
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Truck} title="No suppliers yet" description="Add suppliers to start building price catalogues." onAdd={openAdd} addLabel="Add Supplier" />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell>{s.country}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{Number(s.quality_score).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{s._count.supplier_products}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push(`/admin/catalogue/suppliers/${s.id}`)}>
                        Prices <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
