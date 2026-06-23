import { OrderService } from "../services/order.service";

export const OrderUsecase = {
  getOrders: () => {
    return OrderService.getOrders();
  },
  cancelOrder: ({ orderID }: { orderID: number }) => {
    return OrderService.cancelOrder({ orderID });
  },
};
