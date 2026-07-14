import { Card } from "@/components/ui/card";
import { AdminUsecase } from "@/features/admin/usecase/admin.usecase";
import { OrderEntity } from "@/shared/entities/orders.entity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { toast } from "sonner";

export default function Order({ order }: { order: OrderEntity }) {
  const queryClient = useQueryClient();
  const formatter = new Intl.NumberFormat("vi-VN");
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderID: number) => {
      return AdminUsecase.cancelAdminOrder(orderID);
    },
    onSuccess: () => {
      toast.success("Canceled Order!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => {
      toast.error("Failed to cancel order.");
    },
  });
  const handleCancelOrder = (orderID: number) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate(orderID);
    }
  };
  return (
    <Card key={order.OrderID} className="flex flex-col lg:flex-row p-5 gap-8">
      {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
      <div className="w-full lg:w-1/2">
        <div
          className={clsx(
            "w-full  overflow-y-auto overflow-x-hidden pr-2 space-y-6 pt-3",
            {
              "h-75": order.items.length > 1,
            },
          )}
        >
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex gap-5 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className="relative shrink-0">
                <img
                  src={item.MainImage}
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
                  <h6 className="block md:hidden text-red-500 font-bold">
                    {formatter.format(item.Quantity * item.Price)}đ
                  </h6>
                </div>
                <div className="hidden md:block w-1/3 text-right">
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
            <span className="text-red-500 font-bold">{order.OrderID}</span>
          </li>
          <li>Order Date: {new Date(order.Date).toDateString()}</li>
          <li>Receiver Name: {order.ReceiverName}</li>
          <li>Receiver Phone: {order.Phone}</li>
          <li>Receiver Address: {order.Address}</li>
          <li>Shipping Method: {order.Shipping} Shipping</li>
          <li>Payment Method: {order.Payment}</li>
          <li>
            Order Status:{" "}
            <span
              className={`font-bold text-lg ${
                order.Status === "Declined" || order.Status === "Canceled"
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
            {cancelOrderMutation.isPending ? "CANCELING..." : "CANCEL ORDER"}
          </button>
        )}
      </div>
    </Card>
  );
}
