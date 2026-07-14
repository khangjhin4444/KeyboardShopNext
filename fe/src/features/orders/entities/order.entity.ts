import {
  CancelOrderResponseEntity,
  OrdersResponseEntity,
} from "@/shared/entities/orders.entity";
import {
  CancelOrderResponseModel,
  OrdersResponseModel,
} from "../models/orders.response";

export function convertToOrdersResponseEntity(
  responeModel: OrdersResponseModel,
): OrdersResponseEntity {
  return {
    orders: responeModel.data,
    length: responeModel.length,
  };
}

export function convertToCancelOrderResponseEntity(
  responseModel: CancelOrderResponseModel,
): CancelOrderResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
  };
}
