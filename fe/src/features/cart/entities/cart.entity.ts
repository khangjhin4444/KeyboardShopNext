import {
  AddToCartResponseModel,
  CartItemsResponseModel,
  ChangeItemQuantityResponseModel,
  DeleteCartItemResponseModel,
  PlaceOrderResponseModel,
} from "../models/cart.model";

export interface AddToCartResponseEntity {
  success: boolean;
  message: string;
  newQuantity?: number;
}

export interface CartItemEntity {
  CartItemID: number;
  Quantity: number;
  MainImage: string;
  Price: number;
  Name: string;
  Color: string;
  Stock: number;
  VariantID: number;
}

export interface ChangeItemQuantityResponseEntity {
  success: boolean;
  message: string;
  newQuantity?: number;
}

export interface DeleteCartItemResponseEntity {
  success: boolean;
  message: string;
  newQuantity?: number;
}

export interface CartItemResponseEntity {
  items: CartItemEntity[];
}

export interface PlaceOrderResponseEntity {
  success: boolean;
  message: string;
}

export function convertToCartItemEntity(
  responseModel: CartItemsResponseModel,
): CartItemResponseEntity {
  return {
    items: responseModel.items,
  };
}

export function convertToAddToCartResponseEntity(
  responseModel: AddToCartResponseModel,
): AddToCartResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
    newQuantity: responseModel.newQuantity,
  };
}

export function convertToChangeItemQuantityResponseEntity(
  responseModel: ChangeItemQuantityResponseModel,
): AddToCartResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
    newQuantity: responseModel.newQuantity,
  };
}

export function convertToDeleteCartItemResponseEntity(
  responseModel: DeleteCartItemResponseModel,
): DeleteCartItemResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
    newQuantity: responseModel.newQuantity,
  };
}

export function convertToPlaceOrderResponseEntity(
  responseModel: PlaceOrderResponseModel,
): PlaceOrderResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
  };
}
