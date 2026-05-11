export type UserRole = "super_admin" | "agent" | "buyer_agent";

export type SupplierStatus = "active" | "inactive" | "suspended";
export type StockStatus = "ok" | "low" | "out";
export type QualityTier = "tier_1" | "tier_2" | "tier_3";
export type RFQStatus = "draft" | "sent" | "confirmed" | "cancelled";
export type OrderStatus = "confirmed" | "processing" | "partially_delivered" | "delivered";
export type SubPOStatus = "sent" | "acknowledged" | "dispatched" | "delivered";
export type InvoiceStatus = "draft" | "sent" | "paid";
export type CommissionStatus = "pending" | "paid";
export type AgentStatus = "active" | "inactive";

// Safe supplier product — supplier identity stripped for agent-role responses
export interface SafeSupplierProduct {
  id: string;
  product_id: string;
  unit_price: number;
  currency: string;
  lead_time_days: number;
  moq: number;
  quality_tier: QualityTier;
  stock_status: StockStatus;
  last_updated: string;
  // supplier_id intentionally omitted
}

export interface QuotationOption {
  rank: number;
  supplier_product_id: string;
  unit_price: number;
  buyer_unit_price: number; // with margin applied
  currency: string;
  lead_time_days: number;
  moq: number;
  quality_tier: QualityTier;
  stock_status: StockStatus;
}
