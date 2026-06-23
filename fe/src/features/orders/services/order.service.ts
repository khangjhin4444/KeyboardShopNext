import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  CancelOrderResponseEntity,
  convertToCancelOrderResponseEntity,
  convertToOrdersResponseEntity,
  OrdersResponseEntity,
} from "../entities/order.entity";

type GetOrders = () => Promise<OrdersResponseEntity>;
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
  getOrders: async function () {
    try {
      const response = await fetchWithAuth("http://localhost:8000/api/orders");
      return convertToOrdersResponseEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelOrder: async function ({ orderID }: { orderID: number }) {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/api/orders/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderID,
          }),
        },
      );
      return convertToCancelOrderResponseEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
