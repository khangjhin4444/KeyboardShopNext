import { CartService } from "../services/cart.service";

export const CartUsecase = {
  addToCart: ({
    VariantID,
    Quantity,
  }: {
    VariantID: number;
    Quantity: number;
  }) => {
    return CartService.addToCart({ VariantID, Quantity });
  },
  getCartItems: () => {
    return CartService.getCartItems();
  },
  changeItemQuantity: ({
    VariantID,
    Quantity,
  }: {
    VariantID: number;
    Quantity: number;
  }) => {
    return CartService.changeQuantity({ VariantID, Quantity });
  },
  deleteCartItem: ({ VariantID }: { VariantID: number }) => {
    return CartService.deleteCartItem({ VariantID });
  },
  placeOrder: ({
    name,
    phone,
    address,
    shipping,
    payment,
    total,
    variantIds,
    buyNowItems,
  }: {
    name: string;
    phone: string;
    address: string;
    shipping: string;
    payment: string;
    total: number;
    variantIds?: number[];
    buyNowItems?: { VariantID: number; Quantity: number };
  }) => {
    return CartService.placeOrder({
      name,
      phone,
      address,
      shipping,
      payment,
      total,
      variantIds,
      buyNowItems,
    });
  },
  getCartQuantity: async () => {
    return CartService.getCartQuantity();
  },
};
