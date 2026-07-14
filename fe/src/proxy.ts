import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Proxy BÂY GIỜ kiểm tra Refresh Token (cái duy nhất nó thấy được trong Cookie)
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  const isPrivatePage =
    pathname.startsWith("/product") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/orders");
  const isPublicPage = pathname.startsWith("/home");
  const isAdminPage = pathname.startsWith("/admin");
  if (isPublicPage && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (pathname === "/login" && refreshToken) {
    if (role === "admin") {
      // Nếu là Admin -> Cho thẳng vào Admin Dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      // Nếu là Khách -> Cho về Home mua sắm
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
  if (isAdminPage) {
    console.log(refreshToken);
    if (!refreshToken) {
      // Chưa đăng nhập -> Đá về Login
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "admin") {
      // Đã đăng nhập nhưng KHÔNG phải admin -> Đá về trang chủ để khách tiếp tục xem hàng
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
  if (isPrivatePage && !refreshToken) {
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
