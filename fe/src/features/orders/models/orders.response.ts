import { OrderEntity } from "../entities/order.entity";

export interface OrdersResponseModel {
  success: boolean;
  length: number;
  data: OrderEntity[];
}

export interface CancelOrderResponseModel {
  success: boolean;
  message: string;
}
