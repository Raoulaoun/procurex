import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["agent", "supplier", "buyer"] as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, company, email, phone, role, message } = body as Record<string, string>;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!company?.trim()) return NextResponse.json({ error: "Company is required" }, { status: 400 });
  if (!email?.trim() || !email.includes("@")) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return NextResponse.json({ error: "Role must be agent, supplier, or buyer" }, { status: 400 });
  }

  const record = await prisma.demoRequest.create({
    data: {
      name: name.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      role,
      message: message?.trim() || null,
    },
  });

  return NextResponse.json({ id: record.id }, { status: 201 });
}
