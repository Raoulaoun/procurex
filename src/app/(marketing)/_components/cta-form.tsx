"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

type Role = "agent" | "supplier" | "buyer";

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "agent", label: "Agent", desc: "I source & close deals for buyers" },
  { value: "supplier", label: "Supplier", desc: "I supply products to the market" },
  { value: "buyer", label: "Buyer", desc: "I purchase goods through agents" },
];

export default function CTAForm({ preselectedRole }: { preselectedRole: Role | "" }) {
  const [role, setRole] = useState<Role>("agent");
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (preselectedRole) setRole(preselectedRole);
  }, [preselectedRole]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/landing/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <section id="demo" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Left: copy */}
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Get Started</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Request a<br /> demo
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              See ProcureX in action with a live walkthrough tailored to your role. We&apos;ll show you how the platform fits your workflow in 20 minutes.
            </p>
            <div className="space-y-4">
              {[
                "Live demo of the full quote-to-delivery flow",
                "Pricing and onboarding timeline",
                "Custom setup for your market and product catalogue",
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" style={{ height: "1.125rem", width: "1.125rem" }} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Request received!</h3>
                  <p className="text-sm text-gray-500">
                    We&apos;ll reach out within 1 business day to schedule your demo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      I am a…
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className="p-3 rounded-xl border-2 text-left transition-all"
                          style={role === r.value
                            ? { borderColor: "#1e4db7", backgroundColor: "#eff6ff" }
                            : { borderColor: "#e5e7eb", backgroundColor: "#fff" }
                          }
                        >
                          <p className="text-xs font-bold text-gray-900">{r.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Ahmad Al-Rashid"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Company *</label>
                      <input
                        required
                        value={form.company}
                        onChange={set("company")}
                        placeholder="Gulf Trading LLC"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Work Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="ahmad@gulftrading.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="+971 50 000 0000"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Anything specific you want to see?</label>
                    <textarea
                      value={form.message}
                      onChange={set("message")}
                      rows={3}
                      placeholder="e.g. We handle food commodities across the GCC..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#1e4db7" }}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                    ) : "Request a Demo →"}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    No commitment. We&apos;ll contact you within 1 business day.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
