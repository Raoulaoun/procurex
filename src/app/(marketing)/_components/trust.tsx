import { AnimateIn } from "./animate-in";

const STATS = [
  { value: "< 2 min", label: "Average quote creation time" },
  { value: "100%", label: "Supplier identity protection" },
  { value: "3-tier", label: "Quality scoring per shipment" },
  { value: "Auto", label: "Commission calculation on delivery" },
];

const TESTIMONIALS = [
  {
    quote: "Before ProcureX, I was spending half my day chasing suppliers. Now I close quotes while the client is still on the phone.",
    name: "Khalid A.",
    role: "Senior Procurement Agent, Gulf Region",
    initials: "KA",
    color: "#0d2144",
  },
  {
    quote: "The blind sourcing model means I can source from multiple suppliers without worrying about price shopping. My margins are finally protected.",
    name: "Nour S.",
    role: "Independent Trade Agent",
    initials: "NS",
    color: "#7c3aed",
  },
  {
    quote: "Getting structured PDFs directly to our inbox instead of voice notes and screenshots has been transformative for our operations team.",
    name: "Faisal M.",
    role: "Operations Manager, Al Baraka Supplies",
    initials: "FM",
    color: "#059669",
  },
];

export default function Trust() {
  return (
    <section className="py-24" style={{ backgroundColor: "#0d2144" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Stats */}
        <AnimateIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{s.value}</p>
                <p className="text-xs text-white/45 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-16" />

        {/* Testimonials */}
        <AnimateIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 text-center mb-10">
            What practitioners say
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <AnimateIn key={t.name} delay={i * 80}>
              <div className="rounded-2xl p-6 bg-white/6 border border-white/10 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} viewBox="0 0 12 12" className="h-3.5 w-3.5 fill-amber-400">
                      <path d="M6 1l1.3 2.8 3 .4-2.2 2.1.5 3L6 7.8l-2.6 1.5.5-3L1.7 4.2l3-.4z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-white/70 leading-relaxed flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
