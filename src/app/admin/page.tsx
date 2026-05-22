import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, Layers, Package, Truck, ShoppingCart, Users, FileText, BarChart3, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  let categories = 0, subcategories = 0, products = 0, suppliers = 0, orders = 0, agents = 0, invoices = 0;
  try {
    [categories, subcategories, products, suppliers, orders, agents, invoices] = await Promise.all([
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.product.count(),
      prisma.supplier.count(),
      prisma.order.count(),
      prisma.agent.count(),
      prisma.invoice.count(),
    ]);
  } catch {
    // DB unreachable — show zeros
  }

  const catalogueStats = [
    { label: "Categories", value: categories, icon: Tag, href: "/admin/catalogue/categories", color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Subcategories", value: subcategories, icon: Layers, href: "/admin/catalogue/subcategories", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Products", value: products, icon: Package, href: "/admin/catalogue/products", color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Suppliers", value: suppliers, icon: Truck, href: "/admin/catalogue/suppliers", color: "text-teal-600", bg: "bg-teal-50" },
  ];

  const operationStats = [
    { label: "Total Orders", value: orders, icon: ShoppingCart, href: "/admin/orders", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Active Agents", value: agents, icon: Users, href: "/admin/agents", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Invoices", value: invoices, icon: FileText, href: "/admin/invoices", color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Analytics", value: null, icon: BarChart3, href: "/admin/reports", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  function StatCard({ label, value, icon: Icon, href, color, bg }: {
    label: string; value: number | null; icon: React.ElementType;
    href: string; color: string; bg: string;
  }) {
    return (
      <Link href={href}>
        <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
                {value !== null ? (
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground mt-1">View →</p>
                )}
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and quick access</p>
      </div>

      <div className="mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Catalogue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {catalogueStats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Operations</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {operationStats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Add a new product", href: "/admin/catalogue/products" },
                { label: "Register a supplier", href: "/admin/catalogue/suppliers" },
                { label: "View all orders", href: "/admin/orders" },
                { label: "Check analytics", href: "/admin/reports" },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <span>{a.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #0d2144 0%, #1e4db7 100%)" }}>
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-1 text-white">ProcureX Admin</h3>
            <p className="text-xs text-white/60 mb-4">End-to-end procurement management</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/80">{products} products across {categories} categories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                <span className="text-xs text-white/80">{suppliers} suppliers registered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                <span className="text-xs text-white/80">{orders} orders processed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
