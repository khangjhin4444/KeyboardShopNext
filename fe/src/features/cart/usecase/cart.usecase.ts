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
};
