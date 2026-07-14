import { OrderEntity } from "@/shared/entities/orders.entity";

export interface OrdersResponseModel {
  success: boolean;
  length: number;
  data: OrderEntity[];
}

export interface CancelOrderResponseModel {
  success: boolean;
  message: string;
}
