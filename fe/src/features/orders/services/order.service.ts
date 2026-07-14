import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  convertToCancelOrderResponseEntity,
  convertToOrdersResponseEntity,
} from "../entities/order.entity";
import {
  CancelOrderResponseEntity,
  OrdersResponseEntity,
} from "@/shared/entities/orders.entity";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
type GetOrders = (status: string) => Promise<OrdersResponseEntity>;
type CancleOrder = ({
  orderID,
}: {
  orderID: number;
}) => Promise<CancelOrderResponseEntity>;

type OrderService = {
  getOrders: GetOrders;
  cancelOrder: CancleOrder;
};

export const OrderService: OrderService = {
  getOrders: async function (status: string) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/orders?status=${status}`,
      );
      return convertToOrdersResponseEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelOrder: async function ({ orderID }: { orderID: number }) {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/orders/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID,
        }),
      });
      return convertToCancelOrderResponseEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
