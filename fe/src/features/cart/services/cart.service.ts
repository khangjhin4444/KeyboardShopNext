import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  AddToCartResponseEntity,
  CartItemEntity,
  CartItemResponseEntity,
  ChangeItemQuantityResponseEntity,
  convertToAddToCartResponseEntity,
  convertToCartItemEntity,
  convertToChangeItemQuantityResponseEntity,
  convertToDeleteCartItemResponseEntity,
  DeleteCartItemResponseEntity,
} from "../entities/cart.entity";

type AddToCart = ({
  VariantID,
  Quantity,
}: {
  VariantID: number;
  Quantity: number;
}) => Promise<AddToCartResponseEntity>;

type ChangeItemQuantity = ({
  VariantID,
  Quantity,
}: {
  VariantID: number;
  Quantity: number;
}) => Promise<ChangeItemQuantityResponseEntity>;

type DeleteCartItem = ({
  VariantID,
}: {
  VariantID: number;
}) => Promise<DeleteCartItemResponseEntity>;

type GetCartItems = () => Promise<CartItemResponseEntity>;

type CartService = {
  addToCart: AddToCart;
  getCartItems: GetCartItems;
  changeQuantity: ChangeItemQuantity;
  deleteCartItem: DeleteCartItem;
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
    return convertToAddToCartResponseEntity(response);
  },
  getCartItems: async function () {
    const response = await fetchWithAuth("http://localhost:8000/api/cart");
    return convertToCartItemEntity(response);
  },
  changeQuantity: async function ({
    VariantID,
    Quantity,
  }: {
    VariantID: number;
    Quantity: number;
  }) {
    const response = await fetchWithAuth(
      "http://localhost:8000/api/cart/change",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ VariantID, Quantity }),
      },
    );
    return convertToChangeItemQuantityResponseEntity(response);
  },
  deleteCartItem: async function ({ VariantID }: { VariantID: number }) {
    const response = await fetchWithAuth(
      "http://localhost:8000/api/cart/delete",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ VariantID }),
      },
    );
    return convertToDeleteCartItemResponseEntity(response);
  },
};
