"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ClipboardList, FileText, DollarSign, Settings, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem { label: string; href: string; icon: LucideIcon; exact?: boolean }

const navItems: NavItem[] = [
  { label: "Dashboard",   href: "/agent",             icon: LayoutDashboard, exact: true },
  { label: "Clients",     href: "/agent/buyers",       icon: Users },
  { label: "Quotes",      href: "/agent/rfqs",         icon: FileText },
  { label: "Orders",      href: "/agent/orders",       icon: ClipboardList },
  { label: "Commissions", href: "/agent/commissions",  icon: DollarSign },
  { label: "Surveys",     href: "/agent/surveys",      icon: Star },
  { label: "Settings",    href: "/agent/settings",     icon: Settings },
];

interface AgentProfile { full_name: string; email: string }

export function AgentSidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<AgentProfile | null>(null);

  useEffect(() => {
    fetch("/api/agent/profile")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setProfile({ full_name: d.full_name, email: d.email }))
      .catch(() => null);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "AG";

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col z-30" style={{ backgroundColor: "#0d2144" }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3" style={{ backgroundColor: "#1e4db7" }}>
          P
        </div>
        <span className="text-white font-semibold text-base tracking-tight">ProcureX</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              style={isActive ? { backgroundColor: "#1e4db7" } : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? "Agent"}</p>
            <p className="text-white/40 text-xs truncate">{profile?.email ?? "Loading…"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
