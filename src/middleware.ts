import { NextResponse, type NextRequest } from "next/server";

// ── DEV MODE: auth completely disabled for local preview ──────────────────────
// To re-enable auth, delete the next 3 lines and uncomment the full middleware below
export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/*  ── PRODUCTION MIDDLEWARE (restore when deploying) ──────────────────────────

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/confirm"];

const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  super_admin: ["/admin", "/agent", "/api/admin", "/api/agent"],
  agent: ["/agent", "/api/agent"],
  buyer_agent: ["/agent", "/api/agent"],
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const role = user.user_metadata?.role as string | undefined;
  if (role && pathname !== "/") {
    const allowed = ROLE_ALLOWED_PATHS[role] ?? [];
    const hasAccess = allowed.some((prefix) => pathname.startsWith(prefix));
    const isRestricted = pathname.startsWith("/admin") || pathname.startsWith("/agent");
    if (isRestricted && !hasAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

*/
