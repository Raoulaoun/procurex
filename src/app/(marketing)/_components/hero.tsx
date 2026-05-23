"use client";

import { ChevronDown } from "lucide-react";

export default function Hero({ onDemoClick }: { onDemoClick: () => void }) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0d2144" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gradient orbs */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(30,77,183,0.35) 0%, transparent 70%)",
          filter: "blur(1px)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          filter: "blur(1px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-8 max-w-4xl mx-auto pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/8 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-medium text-white/70 tracking-wide uppercase">B2B Procurement Platform</span>
        </div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.3)" }}
        >
          Procurement, engineered<br className="hidden sm:block" />
          <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {" "}for modern trade
          </span>
        </h1>

        <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          ProcureX connects agents, suppliers, and buyers on a single platform — with
          automated quotations, blind supplier sourcing, and end-to-end order tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onDemoClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #1e4db7 0%, #3b5fc4 100%)" }}
          >
            Request a Demo
          </button>
          <button
            onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold border border-white/20 text-white/85 hover:bg-white/10 transition-all"
          >
            See How It Works
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: "100%", label: "Supplier Privacy" },
            { value: "< 2 min", label: "Quote Creation" },
            { value: "Live", label: "Order Tracking" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/45 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => document.querySelector("#problem")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}
