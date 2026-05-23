"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn, formatCurrency, formatDate, qualityTierLabel } from "@/lib/utils";
import { ChevronRight, Search, Plus, Minus, Trash2, Check, ArrowLeft, Loader2 } from "lucide-react";

interface Buyer { id: string; name: string; company: string }
interface Category { id: string; name: string; name_ar: string; subcategories: { id: string; name: string; name_ar: string }[] }
interface Product { id: string; name: string; name_ar: string; unit: string; subcategory: { id: string; name: string; category_id: string } }
interface QuotationOption {
  rank: number; supplier_product_id: string; buyer_unit_price: number;
  currency: string; lead_time_days: number; moq: number;
  quality_tier: string; stock_status: string; stock_last_updated: string | null; line_total: number;
}
interface LineItem {
  product_id: string; product_name: string; product_name_ar: string; product_unit: string;
  category_id: string; quantity: number;
  options: QuotationOption[];
  selected_option: QuotationOption | null;
  loading_options: boolean;
}

const STOCK_LABELS: Record<string, { label: string; color: string }> = {
  ok:  { label: "In Stock", color: "#059669" },
  low: { label: "Low Stock", color: "#d97706" },
  out: { label: "Out of Stock", color: "#dc2626" },
};

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
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
              )}
                style={done
                  ? { backgroundColor: "#0d2144", borderColor: "#0d2144", color: "#fff" }
                  : active
                  ? { backgroundColor: "#fff", borderColor: "#0d2144", color: "#0d2144" }
                  : { backgroundColor: "#fff", borderColor: "#d1d5db", color: "#9ca3af" }
                }
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span className="text-sm font-medium" style={{ color: active ? "#0d2144" : "#9ca3af" }}>{label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

function NewRFQForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyerId, setBuyerId] = useState(searchParams.get("buyer_id") ?? "");
  const [notes, setNotes] = useState("");
  const [rfqId, setRfqId] = useState<string | null>(null);
  const [creatingRfq, setCreatingRfq] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent/buyers").then(r => r.json()),
      fetch("/api/agent/catalogue/categories").then(r => r.json()),
    ]).then(([b, c]) => { setBuyers(b); setCategories(c); });
  }, []);

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

  async function loadProducts(subId?: string, q?: string) {
    setSearching(true);
    const params = new URLSearchParams();
    if (subId && subId !== "all") params.set("subcategory_id", subId);
    if (q) params.set("q", q);
    const res = await fetch(`/api/agent/catalogue/products?${params}`);
    setProducts(await res.json());
    setSearching(false);
  }

  function handleCatSelect(cat: Category) { setSelectedCat(cat); setSelectedSub(""); setProducts([]); }
  function handleSubSelect(subId: string) { setSelectedSub(subId); loadProducts(subId); }
  function handleSearch(e: React.FormEvent) { e.preventDefault(); if (search.trim()) loadProducts(undefined, search.trim()); }

  const addedIds = new Set(lineItems.map(li => li.product_id));

  function addProduct(p: Product) {
    if (addedIds.has(p.id)) return;
    const catId = selectedCat?.id ?? categories.find(c => c.subcategories.some(s => s.id === p.subcategory.id))?.id ?? "";
    setLineItems(prev => [...prev, {
      product_id: p.id, product_name: p.name, product_name_ar: p.name_ar,
      product_unit: p.unit, category_id: catId, quantity: 1, options: [], selected_option: null, loading_options: false,
    }]);
    setQuantities(prev => ({ ...prev, [p.id]: "1" }));
  }

  function removeLineItem(productId: string) { setLineItems(prev => prev.filter(li => li.product_id !== productId)); }

  function setQty(productId: string, val: string) {
    setQuantities(prev => ({ ...prev, [productId]: val }));
    setLineItems(prev => prev.map(li => li.product_id === productId ? { ...li, quantity: Number(val) || 1 } : li));
  }

  const fetchOptions = useCallback(async () => {
    const updated = await Promise.all(
      lineItems.map(async (li) => {
        const params = new URLSearchParams({ product_id: li.product_id, category_id: li.category_id, quantity: String(li.quantity) });
        const res = await fetch(`/api/agent/quotation-options?${params}`);
        const data = await res.json();
        return { ...li, options: data.options ?? [], loading_options: false };
      })
    );
    setLineItems(updated);
  }, [lineItems]);

  async function handleStep2Next() {
    if (lineItems.length === 0) return;
    setLineItems(prev => prev.map(li => ({ ...li, loading_options: true })));
    setStep(3);
  }

  useEffect(() => {
    if (step === 3 && lineItems.some(li => li.loading_options)) fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function selectOption(productId: string, option: QuotationOption) {
    setLineItems(prev => prev.map(li => li.product_id === productId ? { ...li, selected_option: option } : li));
  }

  function applyTierToAll(tier: string) {
    setLineItems(prev => prev.map(li => {
      const match = li.options.find(o => o.quality_tier === tier);
      return match ? { ...li, selected_option: match } : li;
    }));
  }

  async function handleConfirm() {
    if (!rfqId) return;
    setSaving(true);
    for (const li of lineItems) {
      await fetch(`/api/agent/rfqs/${rfqId}/line-items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: li.product_id, quantity: li.quantity, selected_supplier_product_id: li.selected_option?.supplier_product_id ?? null }),
      });
    }
    await fetch(`/api/agent/rfqs/${rfqId}/confirm`, { method: "POST" });
    setSaving(false);
    setConfirmed(true);
  }

  const allSelected = lineItems.length > 0 && lineItems.every(li => li.selected_option !== null);
  const grandTotal = lineItems.reduce((s, li) => s + (li.selected_option?.line_total ?? 0), 0);

  if (confirmed && rfqId) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quotation Ready</h2>
        <p className="text-gray-500 mb-6">
          Reference <span className="font-mono font-medium text-gray-700">QUO-{rfqId.slice(0, 8).toUpperCase()}</span> has been confirmed.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.open(`/api/agent/rfqs/${rfqId}/pdf`, "_blank")}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => router.push("/agent/rfqs")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#0d2144" }}
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push("/agent/rfqs")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {step > 1 ? "Back" : "Quotes"}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">New Quote</h1>
      <StepIndicator step={step} />

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg">
          <h2 className="font-semibold text-gray-900 mb-4">Select Client & Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Client</label>
              <select
                value={buyerId}
                onChange={e => setBuyerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              >
                <option value="">Select a client…</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} — {b.company}</option>
                ))}
              </select>
              {buyers.length === 0 && <p className="text-xs text-gray-400 mt-1">No buyers assigned. Ask an admin.</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requirements or context…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>
            <button
              onClick={handleStep1Next}
              disabled={!buyerId || creatingRfq}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#0d2144" }}
            >
              {creatingRfq ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>Continue <ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>

            <div className="flex gap-3">
              <div className="w-44 shrink-0">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Categories</p>
                <div className="space-y-0.5">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCatSelect(cat)}
                      className="w-full text-left px-2.5 py-2 text-sm rounded-lg transition-colors"
                      style={selectedCat?.id === cat.id
                        ? { backgroundColor: "#0d2144", color: "#fff" }
                        : { color: "#6b7280" }
                      }
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCat && (
                <div className="w-44 shrink-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Subcategories</p>
                  <div className="space-y-0.5">
                    {selectedCat.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubSelect(sub.id)}
                        className="w-full text-left px-2.5 py-2 text-sm rounded-lg transition-colors"
                        style={selectedSub === sub.id
                          ? { backgroundColor: "#e8f0ff", color: "#1e4db7" }
                          : { color: "#6b7280" }
                        }
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1">
                {searching ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                ) : products.length > 0 ? (
                  <div className="space-y-1">
                    {products.map(p => {
                      const added = addedIds.has(p.id);
                      return (
                        <div key={p.id} className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                          added ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                        )}>
                          <div>
                            <span className="font-medium text-gray-900">{p.name}</span>
                            <span className="text-gray-400 ml-2 text-xs">/ {p.unit}</span>
                          </div>
                          <button
                            onClick={() => addProduct(p)}
                            disabled={added}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-60"
                            style={added ? { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#6ee7b7" } : { borderColor: "#e5e7eb", color: "#374151" }}
                          >
                            {added ? <><Check className="h-3 w-3 inline mr-1" />Added</> : <><Plus className="h-3 w-3 inline mr-1" />Add</>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedSub || search ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No products found.</div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">Select a subcategory or search to browse products.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: selected items */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Selected ({lineItems.length})</p>
            {lineItems.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
                No products added yet
              </div>
            ) : (
              <div className="space-y-2">
                {lineItems.map(li => (
                  <div key={li.product_id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 leading-tight">{li.product_name}</span>
                      <button onClick={() => removeLineItem(li.product_id)} className="text-gray-300 hover:text-red-500 shrink-0 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setQty(li.product_id, String(Math.max(1, li.quantity - 1)))} className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Minus className="h-3 w-3 text-gray-500" />
                      </button>
                      <input
                        type="number" min="1" value={quantities[li.product_id] ?? "1"}
                        onChange={e => setQty(li.product_id, e.target.value)}
                        className="h-6 text-center text-xs w-14 border border-gray-200 rounded px-1 outline-none"
                      />
                      <button onClick={() => setQty(li.product_id, String(li.quantity + 1))} className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Plus className="h-3 w-3 text-gray-500" />
                      </button>
                      <span className="text-xs text-gray-400 ml-1">{li.product_unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleStep2Next}
              disabled={lineItems.length === 0}
              className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#0d2144" }}
            >
              Get Quotes <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-gray-500">Apply to all:</span>
            {[
              { tier: "tier_1", label: "Best Quality" },
              { tier: "tier_2", label: "Balanced" },
              { tier: "tier_3", label: "Best Price" },
            ].map(({ tier, label }) => (
              <button
                key={tier}
                onClick={() => applyTierToAll(tier)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {lineItems.map(li => (
              <div key={li.product_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{li.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {li.quantity} {li.product_unit}</p>
                  </div>
                  {li.selected_option && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Selected — {formatCurrency(li.selected_option.line_total, li.selected_option.currency)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {li.loading_options ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Fetching options…
                    </div>
                  ) : li.options.length === 0 ? (
                    <p className="text-sm text-red-500">No suppliers available for this product at qty {li.quantity}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {li.options.map(opt => {
                        const isSelected = li.selected_option?.supplier_product_id === opt.supplier_product_id;
                        const stock = STOCK_LABELS[opt.stock_status];
                        const tierDisplay =
                          opt.quality_tier === "tier_1" ? { label: "Best Quality", bg: "#0d2144", color: "#fff" }
                          : opt.quality_tier === "tier_2" ? { label: "Balanced", bg: "#e8f0ff", color: "#1e4db7" }
                          : { label: "Best Price", bg: "#f3f4f6", color: "#374151" };
                        return (
                          <button
                            key={opt.supplier_product_id}
                            onClick={() => selectOption(li.product_id, opt)}
                            className="text-left p-3 rounded-xl border-2 transition-all hover:shadow-sm"
                            style={isSelected
                              ? { borderColor: "#1e4db7", backgroundColor: "#f0f4ff" }
                              : { borderColor: "#e5e7eb" }
                            }
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                                style={{ backgroundColor: tierDisplay.bg, color: tierDisplay.color }}>
                                {tierDisplay.label}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                            </div>
                            <p className="text-base font-bold text-gray-900 mt-2">
                              {formatCurrency(opt.buyer_unit_price, opt.currency)}
                              <span className="text-xs font-normal text-gray-400"> / {li.product_unit}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Total: {formatCurrency(opt.line_total, opt.currency)}</p>
                            <p className="text-xs font-medium text-gray-600 mt-1">~{opt.lead_time_days} day delivery</p>
                            <div className="border-t border-gray-100 mt-2 pt-2">
                              <p className="text-xs text-gray-400">MOQ: {opt.moq}</p>
                              <p
                                className="text-xs font-medium mt-0.5 cursor-help"
                                style={{ color: stock?.color }}
                                title={opt.stock_last_updated
                                  ? `Supplier-declared status · Last updated: ${formatDate(opt.stock_last_updated)}`
                                  : "Supplier-declared status · Last update unknown"}
                              >{stock?.label}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div>
              <p className="text-xs text-gray-500">Estimated total</p>
              <p className="text-xl font-bold text-gray-900">{allSelected ? formatCurrency(grandTotal, lineItems[0]?.selected_option?.currency ?? "USD") : "—"}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Products
              </button>
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={handleConfirm}
                  disabled={!allSelected || saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#0d2144" }}
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Confirm on behalf of buyer"}
                </button>
                <p className="text-xs text-gray-500 max-w-xs text-right">
                  Click once the buyer has verbally approved the quote (WhatsApp, call, or in person). This locks the quote and prepares it for conversion to an order.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewRFQPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <NewRFQForm />
    </Suspense>
  );
}
