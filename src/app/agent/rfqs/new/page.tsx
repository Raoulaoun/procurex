"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, qualityTierLabel } from "@/lib/utils";
import { ChevronRight, Search, Plus, Minus, Trash2, Check, ArrowLeft, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Buyer { id: string; name: string; company: string }
interface Category { id: string; name: string; name_ar: string; subcategories: { id: string; name: string; name_ar: string }[] }
interface Product { id: string; name: string; name_ar: string; unit: string; subcategory: { id: string; name: string; category_id: string } }
interface QuotationOption {
  rank: number; supplier_product_id: string; buyer_unit_price: number;
  currency: string; lead_time_days: number; moq: number;
  quality_tier: string; stock_status: string; line_total: number;
}
interface LineItem {
  product_id: string; product_name: string; product_name_ar: string; product_unit: string;
  category_id: string; quantity: number;
  options: QuotationOption[];
  selected_option: QuotationOption | null;
  loading_options: boolean;
}

const STOCK_LABELS: Record<string, { label: string; class: string }> = {
  ok: { label: "In Stock", class: "text-green-600" },
  low: { label: "Low Stock", class: "text-yellow-600" },
  out: { label: "Out of Stock", class: "text-red-500" },
};

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Buyer & Details", "Select Products", "Review & Confirm"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                done ? "bg-primary border-primary text-primary-foreground" :
                active ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"
              )}>
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span className={cn("text-sm", active ? "font-medium" : "text-muted-foreground")}>{label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NewRFQPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyerId, setBuyerId] = useState("");
  const [notes, setNotes] = useState("");
  const [rfqId, setRfqId] = useState<string | null>(null);
  const [creatingRfq, setCreatingRfq] = useState(false);

  // Step 2 state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  // Step 3 state
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Load buyers and categories on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/agent/buyers").then(r => r.json()),
      fetch("/api/agent/catalogue/categories").then(r => r.json()),
    ]).then(([b, c]) => { setBuyers(b); setCategories(c); });
  }, []);

  // ── Step 1: create RFQ ──────────────────────────────────────────────────────
  async function handleStep1Next() {
    if (!buyerId) return;
    setCreatingRfq(true);
    const res = await fetch("/api/agent/rfqs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer_id: buyerId, notes }),
    });
    const data = await res.json();
    setRfqId(data.id);
    setCreatingRfq(false);
    setStep(2);
  }

  // ── Step 2: product search ──────────────────────────────────────────────────
  async function loadProducts(subId?: string, q?: string) {
    setSearching(true);
    const params = new URLSearchParams();
    if (subId && subId !== "all") params.set("subcategory_id", subId);
    if (q) params.set("q", q);
    const res = await fetch(`/api/agent/catalogue/products?${params}`);
    setProducts(await res.json());
    setSearching(false);
  }

  function handleCatSelect(cat: Category) {
    setSelectedCat(cat);
    setSelectedSub("");
    setProducts([]);
  }

  function handleSubSelect(subId: string) {
    setSelectedSub(subId);
    loadProducts(subId);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) loadProducts(undefined, search.trim());
  }

  const addedIds = new Set(lineItems.map(li => li.product_id));

  function addProduct(p: Product) {
    if (addedIds.has(p.id)) return;
    const catId = selectedCat?.id ??
      categories.find(c => c.subcategories.some(s => s.id === p.subcategory.id))?.id ?? "";
    setLineItems(prev => [...prev, {
      product_id: p.id, product_name: p.name, product_name_ar: p.name_ar,
      product_unit: p.unit, category_id: catId,
      quantity: 1, options: [], selected_option: null, loading_options: false,
    }]);
    setQuantities(prev => ({ ...prev, [p.id]: "1" }));
  }

  function removeLineItem(productId: string) {
    setLineItems(prev => prev.filter(li => li.product_id !== productId));
  }

  function setQty(productId: string, val: string) {
    setQuantities(prev => ({ ...prev, [productId]: val }));
    setLineItems(prev => prev.map(li =>
      li.product_id === productId ? { ...li, quantity: Number(val) || 1 } : li
    ));
  }

  // ── Step 3: fetch quotation options ─────────────────────────────────────────
  const fetchOptions = useCallback(async () => {
    const updated = await Promise.all(
      lineItems.map(async (li) => {
        const params = new URLSearchParams({
          product_id: li.product_id,
          category_id: li.category_id,
          quantity: String(li.quantity),
        });
        const res = await fetch(`/api/agent/quotation-options?${params}`);
        const data = await res.json();
        return { ...li, options: data.options ?? [], loading_options: false };
      })
    );
    setLineItems(updated);
  }, [lineItems]);

  async function handleStep2Next() {
    if (lineItems.length === 0) return;
    // Update quantities on line items then fetch options
    setLineItems(prev => prev.map(li => ({ ...li, loading_options: true })));
    setStep(3);
    // Trigger option fetching after state update
  }

  useEffect(() => {
    if (step === 3 && lineItems.some(li => li.loading_options)) {
      fetchOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function selectOption(productId: string, option: QuotationOption) {
    setLineItems(prev => prev.map(li =>
      li.product_id === productId ? { ...li, selected_option: option } : li
    ));
  }

  function applyTierToAll(tier: string) {
    setLineItems(prev => prev.map(li => {
      const match = li.options.find(o => o.quality_tier === tier);
      return match ? { ...li, selected_option: match } : li;
    }));
  }

  // ── Confirm RFQ ─────────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!rfqId) return;
    setSaving(true);

    // Save all line items with selections
    for (const li of lineItems) {
      await fetch(`/api/agent/rfqs/${rfqId}/line-items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: li.product_id,
          quantity: li.quantity,
          selected_supplier_product_id: li.selected_option?.supplier_product_id ?? null,
        }),
      });
    }

    // Mark as sent
    await fetch(`/api/agent/rfqs/${rfqId}/confirm`, { method: "POST" });
    setSaving(false);
    setConfirmed(true);
  }

  const allSelected = lineItems.length > 0 && lineItems.every(li => li.selected_option !== null);
  const grandTotal = lineItems.reduce((s, li) => s + (li.selected_option?.line_total ?? 0), 0);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (confirmed && rfqId) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Quotation Ready</h2>
        <p className="text-muted-foreground mb-6">
          Reference <span className="font-mono font-medium">QUO-{rfqId.slice(0, 8).toUpperCase()}</span> has been confirmed.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.open(`/api/agent/rfqs/${rfqId}/pdf`, "_blank")}>
            Download PDF
          </Button>
          <Button onClick={() => router.push("/agent/rfqs")}>Back to RFQs</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push("/agent/rfqs")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {step > 1 ? "Back" : "My RFQs"}
      </button>

      <h1 className="text-2xl font-bold mb-6">New RFQ</h1>
      <StepIndicator step={step} />

      {/* ── Step 1 ──────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <Card className="max-w-lg">
          <CardHeader><CardTitle className="text-base">Select Buyer & Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Buyer</Label>
              <Select value={buyerId} onValueChange={setBuyerId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a buyer" /></SelectTrigger>
                <SelectContent>
                  {buyers.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name} — {b.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {buyers.length === 0 && <p className="text-xs text-muted-foreground mt-1">No buyers assigned to you yet. Ask an admin.</p>}
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input className="mt-1" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements or context…" />
            </div>
            <Button className="w-full" onClick={handleStep1Next} disabled={!buyerId || creatingRfq}>
              {creatingRfq ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</> : <>Continue <ChevronRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2 ──────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: browser + search */}
          <div className="col-span-2 space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="flex-1" />
              <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
            </form>

            {/* Category navigation */}
            <div className="flex gap-3">
              <div className="w-44 shrink-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Categories</p>
                <div className="space-y-0.5">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCatSelect(cat)}
                      className={cn("w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                        selectedCat?.id === cat.id ? "bg-accent font-medium" : "hover:bg-accent/50 text-muted-foreground")}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCat && (
                <div className="w-44 shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Subcategories</p>
                  <div className="space-y-0.5">
                    {selectedCat.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubSelect(sub.id)}
                        className={cn("w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                          selectedSub === sub.id ? "bg-accent font-medium" : "hover:bg-accent/50 text-muted-foreground")}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product list */}
              <div className="flex-1">
                {searching ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
                ) : products.length > 0 ? (
                  <div className="space-y-1">
                    {products.map(p => {
                      const added = addedIds.has(p.id);
                      return (
                        <div key={p.id} className={cn("flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors", added ? "bg-accent/30 border-accent" : "hover:bg-muted/50")}>
                          <div>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">/ {p.unit}</span>
                            {p.name_ar && <div className="text-xs text-muted-foreground" dir="rtl">{p.name_ar}</div>}
                          </div>
                          <Button size="sm" variant={added ? "secondary" : "outline"} onClick={() => addProduct(p)} disabled={added} className="h-7 text-xs">
                            {added ? <><Check className="h-3 w-3 mr-1" /> Added</> : <><Plus className="h-3 w-3 mr-1" /> Add</>}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedSub || search ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No products found.</div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">Select a subcategory or search to browse products.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: selected items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Selected ({lineItems.length})</p>
            </div>
            {lineItems.length === 0 ? (
              <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">No products added yet.</div>
            ) : (
              <div className="space-y-2">
                {lineItems.map(li => (
                  <div key={li.product_id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-medium leading-tight">{li.product_name}</span>
                      <button onClick={() => removeLineItem(li.product_id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setQty(li.product_id, String(Math.max(1, li.quantity - 1)))} className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <Input
                        type="number" min="1" value={quantities[li.product_id] ?? "1"}
                        onChange={e => setQty(li.product_id, e.target.value)}
                        className="h-6 text-center text-xs w-16 px-1"
                      />
                      <button onClick={() => setQty(li.product_id, String(li.quantity + 1))} className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
                      <span className="text-xs text-muted-foreground ml-1">{li.product_unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" onClick={handleStep2Next} disabled={lineItems.length === 0}>
              Get Quotes <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3 ──────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div>
          {/* Apply tier to all */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-muted-foreground">Apply tier to all:</span>
            {["tier_1", "tier_2", "tier_3"].map(tier => (
              <Button key={tier} variant="outline" size="sm" onClick={() => applyTierToAll(tier)}>
                {qualityTierLabel(tier)}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {lineItems.map(li => (
              <Card key={li.product_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">{li.product_name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {li.quantity} {li.product_unit}</p>
                    </div>
                    {li.selected_option && (
                      <Badge variant="success">
                        Selected — {formatCurrency(li.selected_option.line_total, li.selected_option.currency)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {li.loading_options ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Fetching options…
                    </div>
                  ) : li.options.length === 0 ? (
                    <p className="text-sm text-destructive">No suppliers available for this product at qty {li.quantity}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {li.options.map(opt => {
                        const isSelected = li.selected_option?.supplier_product_id === opt.supplier_product_id;
                        const stockInfo = STOCK_LABELS[opt.stock_status];
                        return (
                          <button
                            key={opt.supplier_product_id}
                            onClick={() => selectOption(li.product_id, opt)}
                            className={cn(
                              "text-left p-3 rounded-lg border-2 transition-all hover:shadow-sm",
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant={opt.quality_tier === "tier_1" ? "default" : opt.quality_tier === "tier_2" ? "secondary" : "outline"} className="text-[10px] px-1.5">
                                {qualityTierLabel(opt.quality_tier)}
                              </Badge>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            <p className="text-base font-bold mt-2">{formatCurrency(opt.buyer_unit_price, opt.currency)}<span className="text-xs font-normal text-muted-foreground"> / {li.product_unit}</span></p>
                            <p className="text-xs text-muted-foreground mt-0.5">Total: {formatCurrency(opt.line_total, opt.currency)}</p>
                            <Separator className="my-2" />
                            <p className="text-xs text-muted-foreground">Lead: {opt.lead_time_days} days · MOQ: {opt.moq}</p>
                            <p className={cn("text-xs font-medium mt-0.5", stockInfo?.class)}>{stockInfo?.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer total + confirm */}
          <div className="mt-6 flex items-center justify-between p-4 bg-card border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Estimated total</p>
              <p className="text-xl font-bold">{allSelected ? formatCurrency(grandTotal, lineItems[0]?.selected_option?.currency ?? "USD") : "—"}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>Edit Products</Button>
              <Button onClick={handleConfirm} disabled={!allSelected || saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Confirm & Generate Quote"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
