import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Cho phép bot đọc các trang công khai
      allow: ["/", "/search", "/product", "/category", "/about", "/contact"],
      // Chặn bot vào các trang hệ thống, API, hoặc trang yêu cầu đăng nhập
      disallow: [
        "/api/",
        "/admin/",
        "/cart/",
        "/checkout/",
        "/profile/",
        "/*?q=*", // Chặn cào các URL có query search động để tránh trùng lặp nội dung
      ],
    },
    // Trỏ tới sơ đồ trang web (Sitemap) của bạn để Google index nhanh hơn
    sitemap: "https://keyboard-shop-next-henna.vercel.app/sitemap.xml",
  };
}
