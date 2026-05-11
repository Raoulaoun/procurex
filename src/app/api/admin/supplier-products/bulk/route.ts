import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok, err } from "@/lib/api-auth";

// Bulk update prices for multiple supplier products at once
// Body: { updates: [{ id, unit_price, currency, lead_time_days, moq, stock_status }] }
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { updates } = await req.json();
  if (!Array.isArray(updates) || updates.length === 0) return err("updates array required");

  const results = await prisma.$transaction(
    updates.map((u: { id: string; unit_price: number; currency?: string; lead_time_days?: number; moq?: number; stock_status?: string }) =>
      prisma.supplierProduct.update({
        where: { id: u.id },
        data: {
          unit_price: u.unit_price,
          ...(u.currency && { currency: u.currency }),
          ...(u.lead_time_days != null && { lead_time_days: u.lead_time_days }),
          ...(u.moq != null && { moq: u.moq }),
          ...(u.stock_status && { stock_status: u.stock_status as never }),
          last_updated: new Date(),
        },
      })
    )
  );

  return ok({ updated: results.length });
}
