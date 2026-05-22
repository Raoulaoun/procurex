import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Layers, Package, Truck } from "lucide-react";

export default async function AdminDashboard() {
  let categories = 0, subcategories = 0, products = 0, suppliers = 0;
  try {
    [categories, subcategories, products, suppliers] = await Promise.all([
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.product.count(),
      prisma.supplier.count(),
    ]);
  } catch {
    // DB unreachable — show zeros rather than crashing
  }

  const stats = [
    { label: "Categories", value: categories, icon: Tag, href: "/admin/catalogue/categories" },
    { label: "Subcategories", value: subcategories, icon: Layers, href: "/admin/catalogue/subcategories" },
    { label: "Products", value: products, icon: Package, href: "/admin/catalogue/products" },
    { label: "Suppliers", value: suppliers, icon: Truck, href: "/admin/catalogue/suppliers" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <a key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
