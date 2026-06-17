import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { AddToCartResponseEntity } from "../entities/cart.entity";

type AddToCart = ({
  VariantID,
  Quantity,
}: {
  VariantID: number;
  Quantity: number;
}) => Promise<AddToCartResponseEntity>;

type CartService = {
  addToCart: AddToCart;
};

export const CartService: CartService = {
  addToCart: async function ({
    VariantID,
    Quantity,
  }: {
    VariantID: number;
    Quantity: number;
  }) {
    const response = await fetchWithAuth("http://localhost:8000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // BẮT BUỘC phải có khi POST JSON
      },
      body: JSON.stringify({ VariantID, Quantity }),
    });
    return response;
  },
};
