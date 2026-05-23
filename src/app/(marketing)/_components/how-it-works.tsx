import { AnimateIn } from "./animate-in";

const STEPS = [
  {
    number: "01",
    title: "Agent creates a quotation",
    body: "Select your client, add products from the catalogue, and pick from ranked supplier options. Margins are applied automatically — pricing lands ready to send.",
    color: "#1e4db7",
    bg: "#eff6ff",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="4" y="2" width="24" height="28" rx="4" fill="#dbeafe" />
        <rect x="9" y="8" width="14" height="3" rx="1.5" fill="#1e4db7" />
        <rect x="9" y="14" width="10" height="2.5" rx="1.25" fill="#93c5fd" />
        <rect x="9" y="19" width="12" height="2.5" rx="1.25" fill="#93c5fd" />
        <circle cx="24" cy="25" r="5" fill="#1e4db7" />
        <path d="M22 25l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Buyer approves — agent confirms",
    body: "Once the buyer verbally approves (call, WhatsApp, or in person), the agent marks the quote as confirmed. The platform locks it and prepares supplier purchase orders.",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <circle cx="16" cy="12" r="7" fill="#ede9fe" />
        <circle cx="16" cy="12" r="4" fill="#7c3aed" />
        <path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="25" cy="8" r="5" fill="#7c3aed" />
        <path d="M23 8l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Sub-POs fly to suppliers",
    body: "ProcureX splits the order into per-supplier purchase orders and emails them as PDF attachments — automatically. Suppliers acknowledge receipt and update delivery status.",
    color: "#059669",
    bg: "#f0fdf4",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="3" y="6" width="26" height="20" rx="4" fill="#d1fae5" />
        <path d="M3 10l13 9 13-9" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="25" cy="24" r="5" fill="#059669" />
        <path d="M22.5 24l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Track delivery, earn commission",
    body: "Follow every sub-order through dispatch and delivery. When an order is fully delivered, the agent's commission is calculated automatically and submitted for admin payout.",
    color: "#d97706",
    bg: "#fffbeb",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect x="3" y="16" width="26" height="12" rx="3" fill="#fef3c7" />
        <path d="M3 19h26M11 16v12M21 16v12" stroke="#d97706" strokeWidth="1.5" />
        <rect x="7" y="8" width="18" height="8" rx="3" fill="#fde68a" />
        <path d="M13 12h6" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="28" r="3" fill="#d97706" />
        <circle cx="22" cy="28" r="3" fill="#d97706" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              From quote to commission<br className="hidden sm:block" /> in four steps
            </h2>
          </div>
        </AnimateIn>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-100" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <AnimateIn key={step.number} delay={i * 80}>
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                    style={{ backgroundColor: step.bg }}
                  >
                    {step.icon}
                    <span
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center"
                      style={{ backgroundColor: step.color }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 px-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed px-2">{step.body}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
