import Link from "next/link";
import { LayoutDashboard, Users, FileText, ClipboardList, DollarSign, BarChart2, ArrowRight, ShieldCheck } from "lucide-react";

const AGENT_LINKS = [
  { href: "/agent",             icon: LayoutDashboard, label: "Dashboard",   desc: "Pipeline, KPIs & recent activity" },
  { href: "/agent/buyers",      icon: Users,           label: "Prospects",   desc: "Manage clients & buyer relationships" },
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

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0d2144" }}>P</div>
          <span className="font-bold text-gray-900 text-lg">ProcureX</span>
        </div>
        <span className="text-xs text-gray-400">Procurement Management Platform</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to ProcureX</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Your end-to-end procurement platform — manage buyers, quotations, orders, suppliers, and commissions in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Agent Portal */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0d2144" }}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Agent Portal</h2>
                <p className="text-xs text-gray-400">Sales & procurement operations</p>
              </div>
            </div>
            <div className="space-y-2">
              {AGENT_LINKS.map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
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

          {/* Admin Portal */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1e4db7" }}>
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Admin Portal</h2>
                <p className="text-xs text-gray-400">Catalogue, suppliers & analytics</p>
              </div>
            </div>
            <div className="space-y-2">
              {ADMIN_LINKS.map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all group"
                >
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

        <p className="text-center text-xs text-gray-400 mt-12">
          Dev mode · Auth bypassed · All routes accessible
        </p>
      </div>
    </div>
  );
}
