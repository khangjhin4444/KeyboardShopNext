import { OrdersResponseModel } from "../models/orders.response";

export interface OrdersResponseEntity {
  orders: OrderEntity[];
}

export interface OrderItemEntity {
  OrderItemID: number;
  Name: string;
  Color: string;
  MainImage: string;
  Quantity: number;
  Price: number;
}

export interface OrderEntity {
  OrderID: number;
  UserID: number;
  Date: Date;
  Shipping: string;
  Status: string;
  Payment: string;
  ReceiverName: string;
  Phone: number;
  Address: number;
  Total: number;
  items: OrderItemEntity[];
}

export function convertToOrdersResponseEntity(
  responeModel: OrdersResponseModel,
): OrdersResponseEntity {
  return {
    orders: responeModel.data,
  };
}
