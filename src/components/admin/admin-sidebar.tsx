"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid, Tag, Layers, Package, Truck, BarChart3, Users, ShoppingCart, FileText, ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavLeaf { label: string; href: string; icon: LucideIcon }
interface NavTop { label: string; href: string; icon: LucideIcon; exact?: boolean }
interface NavSection { label: string; items: NavLeaf[] }

type NavEntry = NavTop | NavSection;

const navItems: NavEntry[] = [
  { label: "Overview", href: "/admin", icon: LayoutGrid, exact: true },
  {
    label: "Catalogue",
    items: [
      { label: "Categories", href: "/admin/catalogue/categories", icon: Tag },
      { label: "Subcategories", href: "/admin/catalogue/subcategories", icon: Layers },
      { label: "Products", href: "/admin/catalogue/products", icon: Package },
      { label: "Suppliers", href: "/admin/catalogue/suppliers", icon: Truck },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Agents", href: "/admin/agents", icon: Users },
      { label: "Invoices", href: "/admin/invoices", icon: FileText },
    ],
  },
  {
    label: "Reports",
    items: [{ label: "Analytics", href: "/admin/reports", icon: BarChart3 }],
  },
];

function isTopLevel(entry: NavEntry): entry is NavTop {
  return "href" in entry;
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 flex flex-col z-30" style={{ backgroundColor: "#0d2144" }}>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/10">
        <span className="font-bold text-lg tracking-tight text-white">ProcureX</span>
        <span className="ml-2 text-[10px] font-semibold rounded px-1.5 py-0.5 text-white/80" style={{ backgroundColor: "#1e4db7" }}>
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navItems.map((entry) => {
          if (isTopLevel(entry)) {
            const isActive = entry.exact ? pathname === entry.href : pathname.startsWith(entry.href);
            const Icon = entry.icon;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {entry.label}
              </Link>
            );
          }
          return (
            <div key={entry.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                {entry.label}
              </p>
              <div className="space-y-0.5">
                {entry.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/8"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
