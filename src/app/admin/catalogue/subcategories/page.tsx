"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { CRUDModal } from "@/components/admin/crud-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Pencil, Trash2, Loader2 } from "lucide-react";

interface Category { id: string; name: string }
interface Subcategory {
  id: string; name: string; name_ar: string; category_id: string;
  category: { id: string; name: string };
  _count: { products: number };
}

const empty = { name: "", name_ar: "", category_id: "" };

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filterCat, setFilterCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Subcategory | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = res.ok ? await res.json() : [];
    setCategories(Array.isArray(data) ? data : []);
  }

  async function loadSubs(catId?: string) {
    setLoading(true);
    const q = catId && catId !== "all" ? `?category_id=${catId}` : "";
    const res = await fetch(`/api/admin/subcategories${q}`);
    const data = res.ok ? await res.json() : [];
    setSubcategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); loadSubs(); }, []);

  function openAdd() { setForm(empty); setModal({ open: true, editing: null }); }
  function openEdit(sub: Subcategory) {
    setForm({ name: sub.name, name_ar: sub.name_ar, category_id: sub.category_id });
    setModal({ open: true, editing: sub });
  }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    setSaving(true);
    const { editing } = modal;
    const url = editing ? `/api/admin/subcategories/${editing.id}` : "/api/admin/subcategories";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    closeModal();
    loadSubs(filterCat);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subcategory? This will also remove its products.")) return;
    await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
    loadSubs(filterCat);
  }

  function handleFilterChange(val: string) {
    setFilterCat(val);
    loadSubs(val);
  }

  return (
    <div>
      <PageHeader title="Subcategories" description="Manage subcategories within each product category" onAdd={openAdd} addLabel="Add Subcategory" />

      <div className="mb-5 flex items-center gap-3">
        <Label className="text-sm shrink-0 text-muted-foreground">Filter by category:</Label>
        <Select value={filterCat} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-52 bg-white">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : subcategories.length === 0 ? (
        <EmptyState icon={Layers} title="No subcategories" description="Add subcategories to organise your products." onAdd={openAdd} addLabel="Add Subcategory" />
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Arabic Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Products</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell dir="rtl" className="text-right">{sub.name_ar}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {sub.category.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {sub._count.products}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(sub.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CRUDModal open={modal.open} onClose={closeModal} title={modal.editing ? "Edit Subcategory" : "Add Subcategory"} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <div>
            <Label>Category</Label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Name (English)</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Solvents" />
          </div>
          <div>
            <Label>Name (Arabic)</Label>
            <Input className="mt-1" dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="المذيبات" />
          </div>
        </div>
      </CRUDModal>
    </div>
  );
}
