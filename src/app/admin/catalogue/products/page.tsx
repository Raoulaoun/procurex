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
import { Textarea } from "@/components/ui/textarea";
import { Package, Pencil, Trash2, Search } from "lucide-react";

interface Category { id: string; name: string }
interface Subcategory { id: string; name: string; category_id: string }
interface Product {
  id: string; name: string; name_ar: string; description: string | null; unit: string;
  subcategory: { id: string; name: string; category: { id: string; name: string } };
  _count: { supplier_products: number };
}

const empty = { name: "", name_ar: "", description: "", unit: "", subcategory_id: "" };

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterSub, setFilterSub] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Product | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty);
  const [formCat, setFormCat] = useState("");
  const [formSubs, setFormSubs] = useState<Subcategory[]>([]);
  const [saving, setSaving] = useState(false);

  async function loadMeta() {
    const [catRes, subRes] = await Promise.all([fetch("/api/admin/categories"), fetch("/api/admin/subcategories")]);
    const cats = await catRes.json();
    const subs = await subRes.json();
    setCategories(cats);
    setSubcategories(subs);
    setFilteredSubs(subs);
  }

  async function loadProducts(subcategoryId?: string, q?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (subcategoryId && subcategoryId !== "all") params.set("subcategory_id", subcategoryId);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/products?${params}`);
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadMeta(); loadProducts(); }, []);

  function handleCatFilter(catId: string) {
    setFilterCat(catId);
    setFilterSub("all");
    if (catId === "all") { setFilteredSubs(subcategories); loadProducts(); }
    else { setFilteredSubs(subcategories.filter((s) => s.category_id === catId)); loadProducts(); }
  }

  function handleSubFilter(subId: string) { setFilterSub(subId); loadProducts(subId); }

  function openAdd() { setForm(empty); setFormCat(""); setFormSubs([]); setModal({ open: true, editing: null }); }
  function openEdit(p: Product) {
    setForm({ name: p.name, name_ar: p.name_ar, description: p.description ?? "", unit: p.unit, subcategory_id: p.subcategory.id });
    setFormCat(p.subcategory.category.id);
    setFormSubs(subcategories.filter((s) => s.category_id === p.subcategory.category.id));
    setModal({ open: true, editing: p });
  }
  function closeModal() { setModal({ open: false, editing: null }); }

  function handleFormCatChange(catId: string) {
    setFormCat(catId);
    setFormSubs(subcategories.filter((s) => s.category_id === catId));
    setForm((f) => ({ ...f, subcategory_id: "" }));
  }

  async function handleSave() {
    setSaving(true);
    const { editing } = modal;
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    closeModal();
    loadProducts(filterSub, search);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts(filterSub, search);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadProducts(filterSub, search);
  }

  return (
    <div>
      <PageHeader title="Products" description="Manage all products in the catalogue" onAdd={openAdd} addLabel="Add Product" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={filterCat} onValueChange={handleCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSub} onValueChange={handleSubFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All subcategories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subcategories</SelectItem>
            {filteredSubs.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-52" />
          <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Add products or adjust your filters." onAdd={openAdd} addLabel="Add Product" />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Arabic Name</TableHead>
                <TableHead>Category / Subcategory</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Suppliers</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell dir="rtl">{p.name_ar}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.subcategory.category.name} / {p.subcategory.name}
                  </TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>{p._count.supplier_products}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CRUDModal open={modal.open} onClose={closeModal} title={modal.editing ? "Edit Product" : "Add Product"} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={formCat} onValueChange={handleFormCatChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subcategory</Label>
              <Select value={form.subcategory_id} onValueChange={(v) => setForm({ ...form, subcategory_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{formSubs.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Name (English)</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acetone" />
          </div>
          <div>
            <Label>Name (Arabic)</Label>
            <Input className="mt-1" dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="أسيتون" />
          </div>
          <div>
            <Label>Unit</Label>
            <Input className="mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. kg, L, pcs" />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
        </div>
      </CRUDModal>
    </div>
  );
}
