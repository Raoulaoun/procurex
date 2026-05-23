import { AnimateIn } from "./animate-in";

const PAINS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
        <circle cx="20" cy="20" r="18" stroke="#ef4444" strokeWidth="2.5" />
        <path d="M13 13l14 14M27 13L13 27" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Supplier negotiations eat weeks",
    body: "Agents waste hours chasing quotes across WhatsApp threads, emails, and calls — with no single source of truth.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
        <rect x="5" y="8" width="30" height="24" rx="4" stroke="#f59e0b" strokeWidth="2.5" />
        <path d="M5 15h30" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="13" cy="26" r="2.5" fill="#f59e0b" />
        <circle cx="27" cy="26" r="2.5" fill="#f59e0b" />
        <path d="M18 24h4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Margins leak through manual pricing",
    body: "Without enforced markup rules, pricing inconsistencies erode margins and make commission tracking a nightmare.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
        <path d="M20 6v8M20 26v8M6 20h8M26 20h8" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="7" stroke="#8b5cf6" strokeWidth="2.5" />
        <path d="M10 10l5 5M25 25l5 5M10 30l5-5M25 15l5-5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Buyers have zero visibility",
    body: "Buyers can't track order status, delivery timelines, or payment status — leading to constant follow-up calls.",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              B2B procurement is still<br className="hidden sm:block" /> broken in 2025
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              From the first quote to the final delivery, every step is fragmented, manual, and opaque — costing you time, money, and trust.
            </p>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAINS.map((p, i) => (
            <AnimateIn key={p.title} delay={i * 100}>
              <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 h-full">
                <div className="mb-4">{p.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
