"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { OrderEntity } from "@/features/orders/entities/order.entity";
import { OrderUsecase } from "@/features/orders/usecase/order.usecase";
import { toast } from "sonner";
import { clsx } from "clsx";
import { M_PLUS_1 } from "next/font/google";
import Order from "./_component/order";

export default function OrdersPage() {
  // 1. Lấy dữ liệu đơn hàng
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-orders"],
    queryFn: () => OrderUsecase.getOrders(), // Hàm gọi API GET /api/orders
  });
  console.log(orders);

  // Trạng thái Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="animate-spin text-[#3B9AB8]" size={48} />
      </div>
    );
  }

  // Trạng thái Lỗi
  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi tải danh sách đơn hàng!
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 font-sans pb-20">
      <div className="text-left mb-6 border-b-2 border-black pb-2 mt-8">
        <h2 className="text-3xl font-bold">Your Orders</h2>
      </div>

      <div className="flex flex-col gap-8">
        {!orders || orders.length === 0 ? (
          <div className="text-3xl font-bold text-center py-20 text-gray-500">
            No orders found!
          </div>
        ) : (
          orders.orders.map((order: OrderEntity) => (
            <Order order={order} key={order.OrderID}></Order>
          ))
        )}
      </div>
    </div>
  );
}
