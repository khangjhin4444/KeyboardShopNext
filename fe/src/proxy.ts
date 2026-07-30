import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const role = token?.role;
  const isAuthenticated = !!token;

  const isPrivatePage =
    pathname.startsWith("/product") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/orders");
  const isPublicPage = pathname.startsWith("/home");
  const isAdminPage = pathname.startsWith("/admin");

  if (isPublicPage && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/login" && isAuthenticated) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  if (isAdminPage) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  if (isPrivatePage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/product/:path*",
    "/profile/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/login",
    "/home/:path*",
  ],
};
