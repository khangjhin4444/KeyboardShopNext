import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        // Khi Frontend gọi bất kỳ link nào bắt đầu bằng /api/...
        source: "/api/:path((?!auth).*)",
        // Vercel sẽ tự động proxy ngầm sang server thật
        destination: "https://keyboardshopnext.onrender.com/api/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
