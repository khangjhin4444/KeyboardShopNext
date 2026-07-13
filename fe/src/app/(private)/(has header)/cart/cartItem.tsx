"use client";
import { Button } from "@/components/ui/button";
import { CartItemEntity } from "@/features/cart/entities/cart.entity";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Quantity from "@/components/quantity";
import { tr } from "motion/react-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { useUserStore } from "@/store/userStore";

export default function CartItem({
  item,
  onUpdateSubTotal,
}: {
  item: CartItemEntity;
  onUpdateSubTotal: (VariantID: number, TotalAmount: number) => void;
}) {
  const queryClient = useQueryClient();
  const formatter = new Intl.NumberFormat("vi-VN");
  const [quantity, setQuantity] = useState<number | string>(item.Quantity);
  const updateCartQuantity = useUserStore((state) => state.updateCartQuantity);
  const changeItemQuantityMutation = useMutation({
    mutationFn: async (payload: { VariantID: number; Quantity: number }) => {
      return CartUsecase.changeItemQuantity(payload); // Trả kết quả về cho onSuccess xử lý
    },
  });

  const deleteCartItemMutation = useMutation({
    mutationFn: async (payload: { VariantID: number }) => {
      return CartUsecase.deleteCartItem(payload);
    },
    onSuccess: (res) => {
      setQuantity(0);
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    },
  });
  const handleUpdateCartAPI = async (newQuantity: number) => {
    try {
      await changeItemQuantityMutation
        .mutateAsync({
          VariantID: item.VariantID,
          Quantity: newQuantity,
        })
        .then((res) => {
          updateCartQuantity(res.newQuantity!);
        });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };
  const handleDeleteItem = async (VariantID: number) => {
    try {
      await deleteCartItemMutation.mutateAsync({ VariantID });
    } catch (error) {
      console.log(error);
    }
  };

  const prevQuantity = useRef(item.Quantity);
  const currentGlobalTotal = useUserStore(
    (state) => state.user?.cartQuantity || 0,
  );
  useEffect(() => {
    if (quantity !== prevQuantity.current && quantity !== "") {
      const delta = Number(quantity) - Number(prevQuantity.current);

      updateCartQuantity(Number(currentGlobalTotal) + delta);
      onUpdateSubTotal(item.VariantID, Number(quantity) * item.Price);
      prevQuantity.current = Number(quantity);
    }
  }, [quantity]);
  return (
    <div
      key={item.CartItemID}
      className="flex flex-col lg:flex-row border-b pb-4 gap-10"
    >
      <div className="flex-1 w-full">
        <img
          src={item.MainImage}
          alt={item.Name}
          className="w-60 h-60 object-cover rounded-md"
        />
      </div>
      <div className="flex flex-3 justify-between w-full">
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="font-semibold text-2xl">{item.Name}</h3>
          <p className="text-gray-700 text-lg">{item.Color}</p>
          <Button
            className="w-20 mt-5"
            variant={"destructive"}
            onClick={() => {
              handleDeleteItem(item.VariantID);
              // setQuantity(0);
            }}
          >
            Delete
          </Button>
        </div>
        <div className="flex-1">
          <div className="font-semibold flex-2 text-lg">
            Price: {formatter.format(item.Price)} VND
          </div>
          <Quantity
            currentStock={item.Stock}
            setQuantity={setQuantity}
            quantity={quantity}
            isCart={true}
            onUpdateCart={handleUpdateCartAPI}
          />
        </div>
        <div className="flex-1 font-semibold text-lg text-end">
          {formatter.format(item.Price * Number(quantity))} VND
        </div>
      </div>
    </div>
  );
}
