import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/school-admin") || pathname.startsWith("/super-admin");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = String(request.cookies.get("userRole")?.value || "").toUpperCase();

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/school-admin") && role && role !== "SCHOOL_ADMIN") {
    return NextResponse.redirect(new URL(role === "SUPER_ADMIN" ? "/super-admin" : "/", request.url));
  }

  if (pathname.startsWith("/super-admin") && role && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(role === "SCHOOL_ADMIN" ? "/school-admin" : "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/school-admin/:path*", "/super-admin/:path*"],
};
