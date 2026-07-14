"use client";

import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Order from "./_component/order";
import { OrderEntity } from "@/shared/entities/orders.entity";
import { AdminUsecase } from "@/features/admin/usecase/admin.usecase";

export default function OrdersPage() {
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    isSuccess: isPendingSuccess,
    isError: isPendingError,
  } = useQuery({
    queryKey: ["admin-orders", "pending"],
    queryFn: () => AdminUsecase.getAdminOrders("Pending"),
  });
  const { data: deliveredData } = useQuery({
    queryKey: ["admin-orders", "delivered"],
    queryFn: () => AdminUsecase.getAdminOrders("Delivered"),
    enabled: isPendingSuccess,
  });

  // 3. GỌI API LẤY ĐƠN CANCELED (Chạy ngầm ở background)
  const { data: canceledData } = useQuery({
    queryKey: ["admin-orders", "canceled"],
    queryFn: () => AdminUsecase.getAdminOrders("Canceled"),
    enabled: isPendingSuccess,
  });
  if (isPendingLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="animate-spin text-[#3B9AB8]" size={48} />
      </div>
    );
  }

  if (isPendingError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load orders!
      </div>
    );
  }

  const OrderList = ({ data }: { data: any }) => {
    if (!data) {
      return (
        <div className="flex justify-center py-20">
          <LoaderCircle className="animate-spin text-gray-400" size={32} />
        </div>
      );
    }

    const orderList = data.orders || [];

    if (orderList.length === 0) {
      return (
        <div className="text-3xl font-bold text-center py-20 text-gray-500">
          No orders found!
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8 mt-6">
        {orderList.map((order: OrderEntity) => (
          <Order order={order} key={order.OrderID} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      <div className="text-left mb-6  pb-2 ">
        <h2 className="text-xl font-bold">Orders Management</h2>
      </div>

      <Tabs defaultValue="pending" className="w-full px-6">
        <TabsList className="flex justify-center w-full">
          <TabsTrigger className="text-lg" value="pending">
            Pending
          </TabsTrigger>
          <TabsTrigger className="text-lg" value="delivered">
            Delivered
          </TabsTrigger>
          <TabsTrigger className="text-lg" value="canceled">
            Canceled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <OrderList data={pendingData} />
        </TabsContent>

        <TabsContent value="delivered">
          <OrderList data={deliveredData} />
        </TabsContent>

        <TabsContent value="canceled">
          <OrderList data={canceledData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
