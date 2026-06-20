import { OrderEntity } from "../entities/order.entity";

export interface OrdersResponseModel {
  success: boolean;
  message: string;
  data: OrderEntity[];
}
