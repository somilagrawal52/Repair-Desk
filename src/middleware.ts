import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "repairdesk_super_secret_jwt_key_2026_kolkata_indore"
);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/repairs",
  "/inventory",
  "/customers",
  "/payments",
  "/technician",
  "/staff",
  "/settings",
  "/reports",
  "/estimates",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("repairdesk_session")?.value;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Expired or forged token
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("repairdesk_session");
      return response;
    }
  }

  // When session cookie is absent in production mode, redirect to login
  if (process.env.NODE_ENV === "production" && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repairs/:path*",
    "/inventory/:path*",
    "/customers/:path*",
    "/payments/:path*",
    "/technician/:path*",
    "/staff/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/estimates/:path*",
  ],
};
