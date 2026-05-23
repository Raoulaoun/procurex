import { AnimateIn } from "./animate-in";

const QuoteIllustration = () => (
  <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-xs mx-auto">
    <rect width="280" height="200" rx="16" fill="#f0f4ff" />
    {/* Document */}
    <rect x="30" y="24" width="140" height="155" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    <rect x="46" y="42" width="60" height="8" rx="3" fill="#0d2144" />
    <rect x="46" y="56" width="100" height="5" rx="2" fill="#e2e8f0" />
    <rect x="46" y="66" width="80" height="5" rx="2" fill="#e2e8f0" />
    {/* Line items */}
    {[84, 100, 116].map((y, i) => (
      <g key={y}>
        <rect x="46" y={y} width="30" height="5" rx="2" fill={i === 0 ? "#dbeafe" : "#e2e8f0"} />
        <rect x="84" y={y} width="55" height="5" rx="2" fill="#e2e8f0" />
        <rect x="148" y={y} width="18" height="5" rx="2" fill="#d1fae5" />
      </g>
    ))}
    {/* Total */}
    <rect x="30" y="152" width="140" height="22" rx="0 0 8 8" fill="#f8fafc" />
    <rect x="112" y="158" width="46" height="8" rx="3" fill="#1e4db7" />
    {/* Options panel */}
    <rect x="178" y="24" width="76" height="110" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    <rect x="186" y="34" width="60" height="5" rx="2" fill="#0d2144" />
    {[48, 68, 88].map((y, i) => (
      <g key={y}>
        <rect x="186" y={y} width="60" height="20" rx="5" fill={i === 0 ? "#eff6ff" : "#f8fafc"} stroke={i === 0 ? "#bfdbfe" : "#f0f0f0"} strokeWidth="1" />
        <rect x="192" y={y + 5} width="20" height="4" rx="2" fill="#e2e8f0" />
        <rect x="216" y={y + 5} width="24" height="4" rx="2" fill={i === 0 ? "#bfdbfe" : "#e2e8f0"} />
        <rect x="192" y={y + 12} width="32" height="3.5" rx="1.5" fill="#e2e8f0" opacity="0.6" />
      </g>
    ))}
    <circle cx="240" cy="152" r="18" fill="#0d2144" />
    <path d="M233 152l4.5 4.5L247 145" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PrivacyIllustration = () => (
  <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-xs mx-auto">
    <rect width="280" height="200" rx="16" fill="#fdf4ff" />
    {/* Agent node */}
    <circle cx="60" cy="100" r="28" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    <circle cx="60" cy="92" r="11" fill="#dbeafe" />
    <path d="M40 116c0-11 9-18 20-18s20 7 20 18" fill="#eff6ff" />
    <text x="60" y="143" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="sans-serif">Agent</text>
    {/* ProcureX shield */}
    <rect x="108" y="72" width="64" height="56" rx="12" fill="#0d2144" />
    <path d="M140 84v24M140 84c-6 0-14 3-14 12s8 12 14 14c6-2 14-5 14-14s-8-12-14-12z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <text x="140" y="145" textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="sans-serif">ProcureX</text>
    {/* Supplier nodes */}
    {[55, 100, 145].map((y, i) => (
      <g key={y}>
        <circle cx="222" cy={y} r="20" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="213" y={y - 7} width="18" height="14" rx="3" fill="#f0fdf4" />
        <rect x="216" y={y - 3} width="12" height="3" rx="1" fill="#86efac" />
        <rect x="216" y={y + 2} width="8" height="2.5" rx="1" fill="#e2e8f0" />
        <text x="222" y={y + 30} textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="sans-serif">{`S${i + 1}`}</text>
      </g>
    ))}
    {/* Lines with lock */}
    <path d="M88 100 L108 100" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="4 3" />
    {[55, 100, 145].map(y => (
      <path key={y} d={`M172 ${100} L202 ${y}`} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 3" />
    ))}
    {/* Eye-off badge */}
    <circle cx="172" cy="32" r="14" fill="#fef9c3" />
    <path d="M166 32c0 0 2-4 6-4s6 4 6 4-2 4-6 4-6-4-6-4z" stroke="#ca8a04" strokeWidth="1.5" fill="none" />
    <circle cx="172" cy="32" r="2" fill="#ca8a04" />
    <path d="M168 28l8 8" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TrackingIllustration = () => (
  <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-xs mx-auto">
    <rect width="280" height="200" rx="16" fill="#f0fdf4" />
    {/* Timeline rail */}
    <rect x="50" y="96" width="180" height="6" rx="3" fill="#e2e8f0" />
    <rect x="50" y="96" width="126" height="6" rx="3" fill="#10b981" />
    {/* Steps */}
    {[
      { x: 50, done: true, label: "Order\nPlaced" },
      { x: 92, done: true, label: "Supplier\nConfirmed" },
      { x: 134, done: true, label: "In\nTransit" },
      { x: 176, done: false, label: "At\nPort" },
      { x: 230, done: false, label: "Delivered" },
    ].map(s => (
      <g key={s.x}>
        <circle cx={s.x} cy="99" r={s.done ? 10 : 8} fill={s.done ? "#10b981" : "white"} stroke={s.done ? "#10b981" : "#d1d5db"} strokeWidth="2" />
        {s.done && <path d={`M${s.x - 4} 99l3 3 5-5`} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
        {!s.done && <circle cx={s.x} cy="99" r="3" fill="#d1d5db" />}
      </g>
    ))}
    {/* Cards */}
    <rect x="30" y="30" width="90" height="52" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    <rect x="40" y="40" width="50" height="6" rx="2" fill="#0d2144" />
    <rect x="40" y="52" width="35" height="4" rx="2" fill="#e2e8f0" />
    <rect x="40" y="60" width="26" height="4" rx="2" fill="#d1fae5" />
    <rect x="40" y="68" width="46" height="4" rx="2" fill="#e2e8f0" />
    {/* Commission card */}
    <rect x="158" y="30" width="96" height="52" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    <rect x="168" y="40" width="40" height="5" rx="2" fill="#e2e8f0" />
    <rect x="168" y="50" width="56" height="12" rx="3" fill="#fef3c7" />
    <rect x="174" y="55" width="28" height="5" rx="2" fill="#d97706" />
    <rect x="168" y="68" width="36" height="4" rx="2" fill="#e2e8f0" />
    {/* Subpo list */}
    <rect x="70" y="125" width="140" height="52" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    {[135, 149, 163].map((y, i) => (
      <g key={y}>
        <circle cx="85" cy={y} r="5" fill={i < 2 ? "#d1fae5" : "#fef3c7"} />
        <rect x="95" y={y - 4} width="60" height="4" rx="2" fill="#e2e8f0" />
        <rect x="163" y={y - 4} width="28" height="4" rx="2" fill={i < 2 ? "#d1fae5" : "#fef3c7"} />
      </g>
    ))}
  </svg>
);

const BLOCKS = [
  {
    tag: "Quotation Engine",
    title: "Close quotes in minutes,\nnot days",
    body: "Create multi-line quotations with smart supplier options in under two minutes. Margins are baked in automatically — you never touch raw supplier prices.",
    illustration: <QuoteIllustration />,
    flip: false,
  },
  {
    tag: "Supplier Privacy",
    title: "Suppliers stay invisible\nto protect your edge",
    body: "Agents see quality tiers, pricing, and lead times — never supplier names. Your sourcing relationships remain your competitive advantage.",
    illustration: <PrivacyIllustration />,
    flip: true,
  },
  {
    tag: "Order Intelligence",
    title: "One screen for everything\nfrom order to delivery",
    body: "Track sub-purchase orders across multiple suppliers, monitor delivery milestones, and automatically trigger commission calculations when orders are fulfilled.",
    illustration: <TrackingIllustration />,
    flip: false,
  },
];

export default function Product() {
  return (
    <section id="product" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">The Platform</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything you need,<br className="hidden sm:block" /> nothing you don&apos;t
            </h2>
          </div>
        </AnimateIn>

        <div className="space-y-20">
          {BLOCKS.map((b, i) => (
            <AnimateIn key={b.tag} delay={50}>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${b.flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-700 mb-4">
                    {b.tag}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-4 whitespace-pre-line">
                    {b.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-base">{b.body}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[220px]">
                  {b.illustration}
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
