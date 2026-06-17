"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Móc trực tiếp hàm logout từ Zustand ra đây
  const logout = useUserStore((state) => state.logout);

  // Khởi tạo QueryClient 1 lần duy nhất bằng useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // 1. Bắt lỗi khi gọi API dạng Lấy Dữ Liệu (GET - useQuery)
        queryCache: new QueryCache({
          onError: (error) => {
            if (error.message === "SESSION_EXPIRED") {
              logout(); // Zustand tự động xoá isAuth và clear localStorage
              router.push("/login"); // Đá về trang đăng nhập ngay lập tức
            }
          },
        }),

        // 2. Bắt lỗi khi gọi API dạng Ghi Dữ Liệu (POST/PUT/DELETE - useMutation)
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error.message === "SESSION_EXPIRED") {
              logout();
              router.push("/login");
            }
          },
        }),

        // Cấu hình mặc định chung cho toàn app
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // Tuyệt đối không retry mù quáng nếu lỗi là do hết hạn phiên
              if (error.message === "SESSION_EXPIRED") return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false, // Tùy chọn: tắt tính năng tự fetch lại khi chuyển tab
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
