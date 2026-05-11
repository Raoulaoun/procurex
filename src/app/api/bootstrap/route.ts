import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

// One-time bootstrap: creates the first super_admin user.
// Protected by a secret token — remove this route after first use.
export async function POST(req: NextRequest) {
  const { email, password, secret } = await req.json();

  if (secret !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  // Only allow if no super_admin exists yet
  const existingAdmin = await prisma.userProfile.findFirst({
    where: { role: "super_admin" },
  });
  if (existingAdmin) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
  }

  const supabase = createAdminClient();

  // Create the Supabase Auth user with role in metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "super_admin" },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Failed to create user" }, { status: 500 });
  }

  // Mirror into user_profiles table
  await prisma.userProfile.create({
    data: { id: data.user.id, email, role: "super_admin" },
  });

  return NextResponse.json({ ok: true, id: data.user.id });
}
