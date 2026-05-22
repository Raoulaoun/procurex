"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { CRUDModal } from "@/components/admin/crud-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tag, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Category {
  id: string; name: string; name_ar: string; margin_pct: number;
  created_at: string; _count: { subcategories: number };
}

const empty = { name: "", name_ar: "", margin_pct: 10 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = res.ok ? await res.json() : [];
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm(empty); setModal({ open: true, editing: null }); }
  function openEdit(cat: Category) {
    setForm({ name: cat.name, name_ar: cat.name_ar, margin_pct: cat.margin_pct });
    setModal({ open: true, editing: cat });
  }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    setSaving(true);
    const { editing } = modal;
    const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    closeModal();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This will also remove all subcategories and products.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader title="Categories" description="Manage product categories and their margin rates" onAdd={openAdd} addLabel="Add Category" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" description="Add your first category to start building the catalogue." onAdd={openAdd} addLabel="Add Category" />
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Arabic Name</TableHead>
                <TableHead className="font-semibold">Margin</TableHead>
                <TableHead className="font-semibold">Subcategories</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell dir="rtl" className="font-medium text-right">{cat.name_ar}</TableCell>
                  <TableCell>
                    <Badge variant={Number(cat.margin_pct) > 10 ? "default" : "secondary"}>
                      {Number(cat.margin_pct).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {cat._count.subcategories}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(cat.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CRUDModal open={modal.open} onClose={closeModal} title={modal.editing ? "Edit Category" : "Add Category"} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <div>
            <Label>Name (English)</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chemicals" />
          </div>
          <div>
            <Label>Name (Arabic)</Label>
            <Input className="mt-1" dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="المواد الكيميائية" />
          </div>
          <div>
            <Label>Margin % <span className="text-muted-foreground font-normal">(min 10)</span></Label>
            <Input className="mt-1" type="number" min="10" step="0.5" value={form.margin_pct} onChange={(e) => setForm({ ...form, margin_pct: Number(e.target.value) })} />
          </div>
        </div>
      </CRUDModal>
    </div>
  );
}
