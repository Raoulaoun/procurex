import { Check } from "lucide-react";
import { AnimateIn } from "./animate-in";

const BENEFITS = [
  "Receive structured, pre-approved purchase orders — no more chasing agents",
  "Automated PDF sub-POs with full order details sent directly to your inbox",
  "Quality score tracking helps you win repeat business",
  "Delivery acknowledgement flow built into the platform",
  "No bidding wars — pricing is set and locked per tier",
];

export default function Suppliers({ onJoin }: { onJoin: () => void }) {
  return (
    <section id="suppliers" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Illustration side */}
          <AnimateIn>
            <div className="relative">
              <div
                className="rounded-2xl p-8 text-white"
                style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.7" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.7" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.5" />
                    </svg>
                  </div>
                  <span className="font-bold text-lg">Supplier Dashboard</span>
                </div>

                {/* Mock PO cards */}
                {[
                  { ref: "PO-A1B2C3D4", items: 3, status: "Sent", amount: "$4,200" },
                  { ref: "PO-E5F6G7H8", items: 5, status: "Acknowledged", amount: "$8,750" },
                  { ref: "PO-I9J0K1L2", items: 2, status: "Dispatched", amount: "$2,100" },
                ].map(po => (
                  <div key={po.ref} className="bg-white/15 rounded-xl p-3.5 mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white font-mono">{po.ref}</p>
                      <p className="text-xs text-white/60 mt-0.5">{po.items} products · {po.amount}</p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white capitalize">
                      {po.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Text side */}
          <AnimateIn delay={100}>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">For Suppliers</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
              More orders,<br /> less back-and-forth
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Join ProcureX as a supplier and receive structured purchase orders automatically. No more negotiating prices on every deal — focus on fulfillment.
            </p>
            <ul className="space-y-3 mb-8">
              {BENEFITS.map(b => (
                <li key={b} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onJoin}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#059669" }}
            >
              Become a Supplier
            </button>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
