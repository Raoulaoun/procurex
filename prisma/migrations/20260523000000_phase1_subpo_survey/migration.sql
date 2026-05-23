-- Phase 1.1: Replace QASurvey (per-order) with SubPOSurvey (per-SubPO)
--
-- Business rule: surveys rate a single supplier shipment (SubPO), not the
-- whole order. This prevents one rating from polluting multiple suppliers'
-- rolling quality averages.

-- 1. Create the new subpo_surveys table
CREATE TABLE "subpo_surveys" (
    "id"              TEXT        NOT NULL,
    "subpo_id"        TEXT        NOT NULL,
    "buyer_id"        TEXT        NOT NULL,
    "delivery_score"  INTEGER     NOT NULL,
    "quality_score"   INTEGER     NOT NULL,
    "accuracy_score"  INTEGER     NOT NULL,
    "packaging_score" INTEGER     NOT NULL,
    "overall_score"   DECIMAL(4,2) NOT NULL,
    "comments"        TEXT,
    "submitted_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subpo_surveys_pkey" PRIMARY KEY ("id")
);

-- 2. FK constraints
ALTER TABLE "subpo_surveys"
    ADD CONSTRAINT "subpo_surveys_subpo_id_fkey"
    FOREIGN KEY ("subpo_id") REFERENCES "sub_pos"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subpo_surveys"
    ADD CONSTRAINT "subpo_surveys_buyer_id_fkey"
    FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Unique: one survey per SubPO
ALTER TABLE "subpo_surveys"
    ADD CONSTRAINT "subpo_surveys_subpo_id_key" UNIQUE ("subpo_id");

-- 4. Backfill from qa_surveys: copy each survey once per SubPO on that order
--    (preserves history; not perfectly accurate for multi-supplier orders,
--    but defensible as a one-time migration from the old per-order model)
INSERT INTO "subpo_surveys" (
    "id", "subpo_id", "buyer_id",
    "delivery_score", "quality_score", "accuracy_score", "packaging_score",
    "overall_score", "comments", "submitted_at"
)
SELECT
    gen_random_uuid()::text AS id,
    sp.id                   AS subpo_id,
    qs.buyer_id,
    qs.delivery_score,
    qs.quality_score,
    qs.accuracy_score,
    qs.packaging_score,
    qs.overall_score,
    qs.comments,
    qs.submitted_at
FROM "qa_surveys" qs
JOIN "sub_pos" sp ON sp.order_id = qs.order_id;

-- 5. Drop the old table
DROP TABLE "qa_surveys";
