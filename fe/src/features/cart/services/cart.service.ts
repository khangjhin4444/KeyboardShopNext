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
  convertToPlaceOrderResponseEntity,
  DeleteCartItemResponseEntity,
  PlaceOrderResponseEntity,
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

type PlaceOrder = ({
  name,
  phone,
  address,
  shipping,
  payment,
  total,
}: {
  name: string;
  phone: string;
  address: string;
  shipping: string;
  payment: string;
  total: number;
}) => Promise<PlaceOrderResponseEntity>;

type CartService = {
  addToCart: AddToCart;
  getCartItems: GetCartItems;
  changeQuantity: ChangeItemQuantity;
  deleteCartItem: DeleteCartItem;
  placeOrder: PlaceOrder;
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
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ VariantID }),
      },
    );
    return convertToDeleteCartItemResponseEntity(response);
  },
  placeOrder: async function ({
    name,
    phone,
    address,
    shipping,
    payment,
    total,
  }: {
    name: string;
    phone: string;
    address: string;
    shipping: string;
    payment: string;
    total: number;
  }) {
    const response = await fetchWithAuth(
      "http://localhost:8000/api/cart/checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          shipping,
          payment,
          total,
        }),
      },
    );

    return convertToPlaceOrderResponseEntity(response);
  },
};
