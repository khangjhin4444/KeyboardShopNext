// file: src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Middleware BÂY GIỜ kiểm tra Refresh Token (cái duy nhất nó thấy được trong Cookie)
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const isPrivatePage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  // Nếu khách cố vào trang PRIVATE mà không có Cookie Refresh Token
  if (isPrivatePage && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Nếu đã có Refresh Token (tức là đã đăng nhập) mà cố vào lại trang /login
  if (pathname === "/login" && refreshToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login"],
};
