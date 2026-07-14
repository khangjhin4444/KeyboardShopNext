export interface OrdersResponseEntity {
  orders: OrderEntity[];
  length: number;
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
  Request: string;
  items: OrderItemEntity[];
}

export interface CancelOrderResponseEntity {
  success: boolean;
  message: string;
}
