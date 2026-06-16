"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth"; // Import hàm vừa tạo ở trên

export default function CartPage() {
  const router = useRouter();
  const formatter = new Intl.NumberFormat("vi-VN");

  // Dùng TanStack Query thay cho toàn bộ logic useEffect cũ
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart-items"],
    queryFn: () => fetchWithAuth("http://localhost:8000/api/private/cart"),
    retry: (failureCount, err) => {
      // Không retry lại (gọi lại mù quáng) nếu lỗi là do hết hạn phiên đăng nhập
      if (err.message === "SESSION_EXPIRED") return false;
      return failureCount < 2; // Các lỗi khác mạng lag thì cho retry 2 lần
    },
  });

  // Xử lý đá văng về trang Login nếu bắt được lỗi hết hạn phiên
  useEffect(() => {
    if (isError && error?.message === "SESSION_EXPIRED") {
      localStorage.removeItem("accessToken");
      router.push("/login");
    }
  }, [isError, error, router]);

  // UI khi đang tải
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="animate-spin text-[#3B9AB8]" size={48} />
      </div>
    );
  }

  // UI khi lỗi (không phải lỗi hết session)
  if (isError && error?.message !== "SESSION_EXPIRED") {
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi tải giỏ hàng: {error.message}
      </div>
    );
  }

  const cartItems = data?.items || [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 py-20 border-2 border-dashed rounded-lg">
          Giỏ hàng đang trống. Hãy thêm một chiếc bàn phím thật xịn nhé!
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500">Số lượng: {item.quantity}</p>
                </div>
              </div>
              <div className="font-bold text-[#7c5c2c] text-lg">
                {formatter.format(item.price * item.quantity)} VND
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-8">
            <button className="bg-[#3B9AB8] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition">
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
