-- Phase 2: Commission Audit Log
-- Adds AuditAction enum and commission_audit_logs table for immutable payout history.

CREATE TYPE "AuditAction" AS ENUM ('paid', 'reversed', 'bulk_paid');

CREATE TABLE "commission_audit_logs" (
  "id"                    TEXT NOT NULL,
  "commission_id"         TEXT NOT NULL,
  "action"                "AuditAction" NOT NULL,
  "reason"                TEXT,
  "performed_by_admin_id" TEXT,
  "amount_at_action"      DECIMAL(12, 2) NOT NULL,
  "performed_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "commission_audit_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "commission_audit_logs"
  ADD CONSTRAINT "commission_audit_logs_commission_id_fkey"
  FOREIGN KEY ("commission_id") REFERENCES "commissions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commission_audit_logs"
  ADD CONSTRAINT "commission_audit_logs_performed_by_admin_id_fkey"
  FOREIGN KEY ("performed_by_admin_id") REFERENCES "user_profiles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
