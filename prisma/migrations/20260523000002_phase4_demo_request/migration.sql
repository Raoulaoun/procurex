-- Phase 4: Landing page demo request capture

CREATE TABLE "demo_requests" (
    "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"       TEXT         NOT NULL,
    "company"    TEXT         NOT NULL,
    "email"      TEXT         NOT NULL,
    "phone"      TEXT,
    "role"       TEXT         NOT NULL,
    "message"    TEXT,
    "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id")
);
