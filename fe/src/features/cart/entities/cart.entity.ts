import { AddToCartResponseModel } from "../models/cart.model";

export interface AddToCartResponseEntity {
  success: boolean;
  message: string;
  newQuantity?: number;
}

export function converToAddToCartResponseEntity(
  responseModel: AddToCartResponseModel,
): AddToCartResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
    newQuantity: responseModel.newQuantity,
  };
}
