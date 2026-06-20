"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { OrderEntity } from "@/features/orders/entities/order.entity";
import { OrderUsecase } from "@/features/orders/usecase/order.usecase";
import { toast } from "sonner";

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const formatter = new Intl.NumberFormat("vi-VN");

  // 1. Lấy dữ liệu đơn hàng
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-orders"],
    queryFn: () => OrderUsecase.getUserOrders(), // Hàm gọi API GET /api/orders
  });

  // 2. Mutation Hủy đơn hàng
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return OrderUsecase.cancelOrder(orderId); // Hàm gọi API PUT /api/orders/cancel/:id
    },
    onSuccess: () => {
      toast.success("Canceled Order!");
      // Tự động fetch lại danh sách đơn hàng mà không cần reload trang
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
    onError: () => {
      toast.error("Failed to cancel order.");
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

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
          orders.map((order: OrderEntity) => (
            <div
              key={order.OrderID}
              className="flex flex-col lg:flex-row border-b-2 border-black p-5 gap-8"
            >
              {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
              <div className="w-full lg:w-1/2">
                <div className="w-full h-[300px] overflow-y-auto overflow-x-hidden pr-2 space-y-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-5 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={item.Image}
                          alt={item.Name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm border border-blue-200">
                          {item.Quantity}
                        </div>
                      </div>

                      <div className="flex justify-between w-full">
                        <div className="flex flex-col gap-1 w-2/3">
                          <h6 className="font-semibold text-lg line-clamp-2 leading-tight">
                            {item.Name}
                          </h6>
                          <h6 className="text-gray-500">{item.Color}</h6>
                        </div>
                        <div className="w-1/3 text-right">
                          <h6 className="text-red-500 font-bold">
                            {formatter.format(item.Quantity * item.Price)}đ
                          </h6>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CỘT GIỮA: THÔNG TIN ĐƠN HÀNG */}
              <div className="w-full lg:w-1/3 text-left space-y-2">
                <h4 className="text-xl font-bold mb-4">Order Information</h4>
                <ul className="space-y-2 text-gray-800">
                  <li>
                    Order ID:{" "}
                    <span className="text-red-500 font-bold">
                      {order.OrderID}
                    </span>
                  </li>
                  <li>
                    Order Date: {order.Date} | Time: {order.Time}
                  </li>
                  <li>Receiver Name: {order.Name}</li>
                  <li>Receiver Phone: {order.Phone}</li>
                  <li>Receiver Address: {order.Address}</li>
                  <li>Shipping Method: {order.Shipping} Shipping</li>
                  <li>Payment Method: {order.Payment}</li>
                  <li>
                    Order Status:{" "}
                    <span
                      className={`font-bold text-lg ${
                        order.Status === "Declined" ||
                        order.Status === "Canceled"
                          ? "text-red-500"
                          : order.Status === "Delivered"
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      {order.Status}
                    </span>
                  </li>
                  <li>
                    Request:{" "}
                    <span className="text-blue-600 font-bold">
                      {order.Request || "No request"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* CỘT PHẢI: TỔNG TIỀN & NÚT HỦY */}
              <div className="w-full lg:w-1/6 flex flex-col items-start lg:items-end pt-3">
                <h3
                  className={`text-2xl font-bold ${
                    order.Status === "Declined" || order.Status === "Canceled"
                      ? "line-through decoration-red-500 decoration-2 text-gray-400"
                      : "text-red-600"
                  }`}
                >
                  {formatter.format(order.Total)}đ
                </h3>

                {order.Status === "Pending" && (
                  <button
                    onClick={() => handleCancelOrder(order.OrderID)}
                    disabled={cancelOrderMutation.isPending}
                    className="mt-6 px-4 py-2 border-2 border-red-500 text-red-500 font-bold rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancelOrderMutation.isPending
                      ? "CANCELING..."
                      : "CANCEL ORDER"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
