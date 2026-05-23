import Link from "next/link";
import { LayoutDashboard, Users, FileText, ClipboardList, DollarSign, BarChart2, ArrowRight, ShieldCheck, EyeOff, TrendingUp, Award } from "lucide-react";

const AGENT_LINKS = [
  { href: "/agent",             icon: LayoutDashboard, label: "Dashboard",   desc: "Pipeline, KPIs & recent activity" },
  { href: "/agent/buyers",      icon: Users,           label: "Clients",     desc: "Manage clients & buyer relationships" },
  { href: "/agent/rfqs",        icon: FileText,        label: "Quotations",  desc: "Create and track quotes" },
  { href: "/agent/orders",      icon: ClipboardList,   label: "Orders",      desc: "Track deliveries & sub-POs" },
  { href: "/agent/commissions", icon: DollarSign,      label: "Commissions", desc: "Monitor earnings & payouts" },
];

const ADMIN_LINKS = [
  { href: "/admin",                       icon: BarChart2,    label: "Overview",  desc: "Catalogue counts at a glance" },
  { href: "/admin/catalogue/products",    icon: FileText,     label: "Products",  desc: "Manage the product catalogue" },
  { href: "/admin/catalogue/suppliers",   icon: ShieldCheck,  label: "Suppliers", desc: "Supplier pricing & quality" },
  { href: "/admin/reports",               icon: BarChart2,    label: "Analytics", desc: "Revenue, margins & performance" },
  { href: "/admin/orders",                icon: ClipboardList,label: "Orders",    desc: "Platform-wide order overview" },
];

const PLATFORM_MODEL = [
  { icon: EyeOff,    text: "Supplier identity always hidden from agents" },
  { icon: TrendingUp,text: "5–15% markup pre-baked into agent prices" },
  { icon: Award,     text: "Commission earned per fulfilled order" },
];

export default function DevPortalPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0d2144" }}>P</div>
          <span className="font-bold text-gray-900 text-lg">ProcureX</span>
        </div>
        <span className="text-xs text-gray-400">Procurement Management Platform · Dev Mode</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Dev Portal</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Auth bypassed — all routes accessible for local development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0d2144" }}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Agent Portal</h2>
                <p className="text-xs text-gray-400">Manage clients, quotes, orders</p>
              </div>
            </div>
            <div className="space-y-2">
              {AGENT_LINKS.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#eff6ff" }}>
                      <Icon className="h-4 w-4" style={{ color: "#1e4db7" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1e4db7" }}>
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Admin Portal</h2>
                <p className="text-xs text-gray-400">Suppliers, catalogue, markup, analytics</p>
              </div>
            </div>
            <div className="space-y-2">
              {ADMIN_LINKS.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f5f3ff" }}>
                      <Icon className="h-4 w-4" style={{ color: "#7c3aed" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #0d2144 0%, #1e4db7 100%)" }}>
          <h3 className="font-semibold text-sm mb-1">Platform Model</h3>
          <p className="text-xs text-white/50 mb-4">How ProcureX works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLATFORM_MODEL.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-sm text-white/80 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Dev mode · Auth bypassed · All routes accessible
        </p>
      </div>
    </div>
  );
}
