"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid, Tag, Layers, Package, Truck, BarChart3, Users, ShoppingCart, FileText,
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
    <aside className="fixed inset-y-0 left-0 w-56 bg-card border-r flex flex-col z-30">
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-bold text-lg tracking-tight">ProcureX</span>
        <span className="ml-2 text-xs bg-primary text-primary-foreground rounded px-1.5 py-0.5">Admin</span>
      </div>

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
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                  isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {entry.label}
              </Link>
            );
          }
          return (
            <div key={entry.label}>
              <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
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
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                        isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
    </aside>
  );
}
