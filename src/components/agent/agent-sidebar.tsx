"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, PlusCircle, LayoutGrid, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem { label: string; href: string; icon: LucideIcon; exact?: boolean }

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/agent", icon: LayoutGrid, exact: true },
  { label: "My RFQs", href: "/agent/rfqs", icon: FileText },
  { label: "New RFQ", href: "/agent/rfqs/new", icon: PlusCircle },
  { label: "Orders", href: "/agent/orders", icon: ShoppingCart },
];

export function AgentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-card border-r flex flex-col z-30">
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-bold text-lg tracking-tight">ProcureX</span>
        <span className="ml-2 text-xs bg-blue-600 text-white rounded px-1.5 py-0.5">Agent</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
      </nav>
    </aside>
  );
}
