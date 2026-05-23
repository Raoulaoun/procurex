import { Check } from "lucide-react";
import { AnimateIn } from "./animate-in";

const BENEFITS = [
  "Generate professional, branded quotations in under 2 minutes",
  "Supplier pricing with margins auto-applied — no manual calculation",
  "Track commissions in real time as orders reach delivery",
  "Manage your full client roster and order history in one place",
  "Download PDF sub-POs and buyer quotations with one click",
  "Arabic-language product names included for local markets",
];

export default function Agents({ onJoin }: { onJoin: () => void }) {
  return (
    <section id="agents" className="py-24" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <AnimateIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">For Agents</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
              Close more deals.<br /> Earn more commission.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Stop juggling spreadsheets and supplier WhatsApp groups. ProcureX gives procurement agents a professional platform to manage the full quote-to-cash cycle.
            </p>
            <ul className="space-y-3 mb-8">
              {BENEFITS.map(b => (
                <li key={b} className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#1e4db7" }} />
                  <span className="text-sm text-gray-600 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onJoin}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#1e4db7" }}
            >
              Join as an Agent
            </button>
          </AnimateIn>

          {/* Illustration side */}
          <AnimateIn delay={100}>
            <div
              className="rounded-2xl p-8 text-white"
              style={{ background: "linear-gradient(135deg, #0d2144 0%, #1e4db7 100%)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M3 3h18M3 3v18M3 3l18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                    <path d="M7 17l3-5 4 3 5-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Agent Dashboard</span>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Quotes Sent", value: "24" },
                  { label: "Active Orders", value: "8" },
                  { label: "Earned", value: "$6,420" },
                ].map(k => (
                  <div key={k.label} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-white">{k.value}</p>
                    <p className="text-xs text-white/50 mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              {[
                { name: "Ahmad Al-Rashid", co: "Gulf Trading LLC", status: "sent", amount: "$3,200" },
                { name: "Sara Khalid", co: "Al Noor Supplies", status: "confirmed", amount: "$7,800" },
                { name: "Mohammed Faris", co: "Delta Imports", status: "delivered", amount: "$1,450" },
              ].map(r => (
                <div key={r.name} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.name}</p>
                    <p className="text-xs text-white/45 truncate">{r.co}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-white">{r.amount}</p>
                    <p className="text-xs text-white/45 capitalize">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
