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
};
