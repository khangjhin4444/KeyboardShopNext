"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { signOut } from "next-auth/react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Khởi tạo QueryClient 1 lần duy nhất bằng useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // 1. Bắt lỗi khi gọi API dạng Lấy Dữ Liệu (GET - useQuery)
        queryCache: new QueryCache({
          onError: (error) => {
            if (error.message === "SESSION_EXPIRED") {
              signOut({ callbackUrl: "/login" });
            }
          },
        }),

        // 2. Bắt lỗi khi gọi API dạng Ghi Dữ Liệu (POST/PUT/DELETE - useMutation)
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error.message === "SESSION_EXPIRED") {
              signOut({ callbackUrl: "/login" });
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
