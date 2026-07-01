import { OrderService } from "../services/order.service";

export const OrderUsecase = {
  getOrders: (state: string) => {
    return OrderService.getOrders(state);
  },
  cancelOrder: ({ orderID }: { orderID: number }) => {
    return OrderService.cancelOrder({ orderID });
  },
};
