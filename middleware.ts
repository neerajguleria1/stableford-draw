import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isValid = rawUrl?.startsWith("http://") || rawUrl?.startsWith("https://");

  if (!isValid) return response;

  const supabase = createClient(rawUrl!, rawKey!);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    // ============================================
    // PROTECTED: /dashboard/* routes
    // ============================================
    if (pathname.startsWith("/dashboard")) {
      // Redirect to login if not authenticated
      if (!session || !user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Authenticated user, allow access
      return response;
    }

    // ============================================
    // PROTECTED: /admin/* routes (admin only)
    // ============================================
    if (pathname.startsWith("/admin")) {
      // Redirect to login if not authenticated
      if (!session || !user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has admin role in JWT metadata
      const isAdmin = user?.user_metadata?.role === "admin" || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!isAdmin) {
        // Non-admin users redirected to dashboard
        console.warn(`Non-admin user ${user?.email} attempted to access /admin`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Admin user, allow access
      return response;
    }

    // ============================================
    // REDIRECT: Authenticated users away from auth pages
    // ============================================
    if (
      pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/signup")
    ) {
      if (session && user) {
        // Authenticated users redirected to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // ============================================
    // PUBLIC ROUTES: Allow all other routes
    // ============================================
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to proceed
    // (safer than blocking access entirely)
    return response;
  }
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/admin/:path*",
    // Auth routes
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ],
};
