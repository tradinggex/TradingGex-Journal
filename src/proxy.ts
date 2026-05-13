import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_EXACT = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);
const PUBLIC_PREFIX = ["/_next/", "/favicon.ico", "/uploads/", "/api/auth/", "/api/webhooks/"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow CORS preflight through without auth — browser never sends cookies on OPTIONS
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (PUBLIC_EXACT.has(pathname) || PUBLIC_PREFIX.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|uploads/).*)"],
};
