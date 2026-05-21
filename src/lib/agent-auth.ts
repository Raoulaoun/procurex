import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const AGENT_ROLES = ["agent", "buyer_agent", "super_admin"];

export async function requireAgent() {
  // DEV MODE: return first agent record without checking Supabase
  const agent = await prisma.agent.findFirst();
  if (!agent) {
    return { error: NextResponse.json({ error: "No agent record in DB. Create one via the admin panel." }, { status: 500 }) };
  }
  return { user: { id: agent.user_id, user_metadata: { role: "super_admin" } }, agent };
}

/* ── PRODUCTION (restore when deploying) ──────────────────────────────────────

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const AGENT_ROLES = ["agent", "buyer_agent", "super_admin"];

export async function requireAgent() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = user.user_metadata?.role as string | undefined;
  if (!role || !AGENT_ROLES.includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const agent = await prisma.agent.findUnique({ where: { user_id: user.id } });
  if (!agent) {
    return { error: NextResponse.json({ error: "No agent profile found. Ask an admin to create one." }, { status: 403 }) };
  }

  return { user, agent };
}

*/
