import { CartItemEntity } from "../entities/cart.entity";

export interface AddToCartResponseModel {
  success: boolean;
  message: string;
  newQuantity?: number;
}
export interface DeleteCartItemResponseModel {
  success: boolean;
  message: string;
  newQuantity?: number;
}

export interface CartItemsResponseModel {
  items: CartItemEntity[];
}

export interface ChangeItemQuantityResponseModel {
  success: boolean;
  message: string;
  newQuantity?: number;
}

export interface PlaceOrderResponseModel {
  success: boolean;
  message: string;
}
