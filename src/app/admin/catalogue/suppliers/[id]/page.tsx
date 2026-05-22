"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CRUDModal } from "@/components/admin/crud-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Save, Trash2, Star, Loader2, Package } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Product { id: string; name: string; unit: string; subcategory: { name: string; category: { name: string } } }
interface SupplierProduct {
  id: string; product_id: string; unit_price: string; currency: string;
  lead_time_days: number; moq: number; quality_tier: string; stock_status: string; last_updated: string;
  product: { id: string; name: string; unit: string; subcategory: { name: string; category: { name: string } } };
}
interface Supplier {
  id: string; name: string; email: string; country: string; status: string;
  quality_score: string;
  supplier_products: SupplierProduct[];
}

type RowEdit = { unit_price: string; currency: string; lead_time_days: string; moq: string; stock_status: string };

const TIERS = ["tier_1", "tier_2", "tier_3"];
const TIER_LABELS: Record<string, string> = { tier_1: "Premium", tier_2: "Standard", tier_3: "Economy" };
const TIER_COLORS: Record<string, string> = {
  tier_1: "bg-violet-50 text-violet-700",
  tier_2: "bg-blue-50 text-blue-700",
  tier_3: "bg-slate-50 text-slate-600",
};
const STOCK_COLORS: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-700",
  low: "bg-amber-50 text-amber-700",
  out: "bg-red-50 text-red-600",
};
const STOCK_LABELS: Record<string, string> = { ok: "In Stock", low: "Low Stock", out: "Out of Stock" };

const emptyForm = { product_id: "", unit_price: "", currency: "USD", lead_time_days: "7", moq: "1", quality_tier: "tier_2", stock_status: "ok" };

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkEdits, setBulkEdits] = useState<Record<string, RowEdit>>({});
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [addSaving, setAddSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [supplierRes, productsRes] = await Promise.all([
      fetch(`/api/admin/suppliers/${id}`),
      fetch("/api/admin/products"),
    ]);
    const supplierData: Supplier = await supplierRes.json();
    const productsData: Product[] = await productsRes.json();
    setSupplier(supplierData);
    setAllProducts(productsData);

    const edits: Record<string, RowEdit> = {};
    supplierData.supplier_products.forEach((sp) => {
      edits[sp.id] = {
        unit_price: Number(sp.unit_price).toFixed(2),
        currency: sp.currency,
        lead_time_days: String(sp.lead_time_days),
        moq: String(sp.moq),
        stock_status: sp.stock_status,
      };
    });
    setBulkEdits(edits);
    setDirtyRows(new Set());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function handleCellChange(spId: string, field: keyof RowEdit, value: string) {
    setBulkEdits((prev) => ({ ...prev, [spId]: { ...prev[spId], [field]: value } }));
    setDirtyRows((prev) => new Set(prev).add(spId));
  }

  async function handleBulkSave() {
    if (dirtyRows.size === 0) return;
    setSaving(true);
    const updates = Array.from(dirtyRows).map((spId) => {
      const e = bulkEdits[spId];
      return {
        id: spId,
        unit_price: parseFloat(e.unit_price),
        currency: e.currency,
        lead_time_days: parseInt(e.lead_time_days),
        moq: parseInt(e.moq),
        stock_status: e.stock_status,
      };
    });
    await fetch("/api/admin/supplier-products/bulk", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }),
    });
    setSaving(false);
    load();
  }

  async function handleDelete(spId: string) {
    if (!confirm("Remove this product from the supplier's catalogue?")) return;
    await fetch(`/api/admin/supplier-products/${spId}`, { method: "DELETE" });
    load();
  }

  async function handleAdd() {
    setAddSaving(true);
    await fetch("/api/admin/supplier-products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier_id: id, ...form, unit_price: parseFloat(form.unit_price), lead_time_days: parseInt(form.lead_time_days), moq: parseInt(form.moq) }),
    });
    setAddSaving(false);
    setAddModal(false);
    setForm(emptyForm);
    load();
  }

  const existingProductIds = new Set(supplier?.supplier_products.map((sp) => sp.product_id));
  const availableProducts = allProducts.filter((p) => !existingProductIds.has(p.id));

  if (loading || !supplier) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/admin/catalogue/suppliers")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to suppliers
      </button>

      {/* Supplier header */}
      <div className="flex items-start justify-between mb-6 pb-5 border-b">
        <div>
          <h1 className="text-xl font-semibold">{supplier.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">{supplier.email}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600">{supplier.country}</span>
            <Badge variant={supplier.status === "active" ? "success" : "secondary"}>{supplier.status}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{Number(supplier.quality_score).toFixed(1)}</span> quality score
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {dirtyRows.size > 0 && (
            <Button onClick={handleBulkSave} disabled={saving} size="sm" style={{ backgroundColor: "#0d2144" }}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
              {saving ? "Saving…" : `Save ${dirtyRows.size} change${dirtyRows.size > 1 ? "s" : ""}`}
            </Button>
          )}
          <Button onClick={() => setAddModal(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Product
          </Button>
        </div>
      </div>

      {supplier.supplier_products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1.5">No products in catalogue</h3>
          <p className="text-sm text-muted-foreground mb-5">Click &quot;Add Product&quot; to assign products and set prices.</p>
          <Button onClick={() => setAddModal(true)} size="sm" style={{ backgroundColor: "#0d2144" }}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Product
          </Button>
        </div>
      ) : (
        <>
          {dirtyRows.size > 0 && (
            <div className="mb-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              {dirtyRows.size} row{dirtyRows.size > 1 ? "s" : ""} modified — click <strong>Save changes</strong> to commit.
            </div>
          )}
          <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Tier</TableHead>
                  <TableHead className="font-semibold">Unit Price</TableHead>
                  <TableHead className="font-semibold">Currency</TableHead>
                  <TableHead className="font-semibold">Lead Days</TableHead>
                  <TableHead className="font-semibold">MOQ</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold text-xs font-normal text-muted-foreground">Updated</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplier.supplier_products.map((sp) => {
                  const row = bulkEdits[sp.id];
                  const dirty = dirtyRows.has(sp.id);
                  return (
                    <TableRow key={sp.id} className={dirty ? "bg-amber-50/60" : "hover:bg-muted/20 transition-colors"}>
                      <TableCell>
                        <div className="font-medium text-sm">{sp.product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {sp.product.subcategory.category.name} / {sp.product.subcategory.name} · {sp.product.unit}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[sp.quality_tier] ?? "bg-muted text-muted-foreground"}`}>
                          {TIER_LABELS[sp.quality_tier]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" min="0" step="0.01"
                          value={row?.unit_price ?? ""}
                          onChange={(e) => handleCellChange(sp.id, "unit_price", e.target.value)}
                          className="w-24 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row?.currency} onValueChange={(v) => handleCellChange(sp.id, "currency", v)}>
                          <SelectTrigger className="w-20 h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["USD", "EUR", "GBP", "AED", "SAR", "CNY"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" min="1"
                          value={row?.lead_time_days ?? ""}
                          onChange={(e) => handleCellChange(sp.id, "lead_time_days", e.target.value)}
                          className="w-20 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" min="1"
                          value={row?.moq ?? ""}
                          onChange={(e) => handleCellChange(sp.id, "moq", e.target.value)}
                          className="w-20 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row?.stock_status} onValueChange={(v) => handleCellChange(sp.id, "stock_status", v)}>
                          <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ok">In Stock</SelectItem>
                            <SelectItem value="low">Low Stock</SelectItem>
                            <SelectItem value="out">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(sp.last_updated)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => handleDelete(sp.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CRUDModal open={addModal} onClose={() => { setAddModal(false); setForm(emptyForm); }} title="Add Product to Catalogue" onSave={handleAdd} saving={addSaving}>
        <div className="space-y-3">
          <div>
            <Label>Product</Label>
            <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {availableProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unit Price</Label>
              <Input className="mt-1" type="number" min="0" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "GBP", "AED", "SAR", "CNY"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lead Time (days)</Label>
              <Input className="mt-1" type="number" min="1" value={form.lead_time_days} onChange={(e) => setForm({ ...form, lead_time_days: e.target.value })} />
            </div>
            <div>
              <Label>MOQ</Label>
              <Input className="mt-1" type="number" min="1" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quality Tier</Label>
              <Select value={form.quality_tier} onValueChange={(v) => setForm({ ...form, quality_tier: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stock Status</Label>
              <Select value={form.stock_status} onValueChange={(v) => setForm({ ...form, stock_status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CRUDModal>
    </div>
  );
}
