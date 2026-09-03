"use client";
import { Button } from "@/components/ui/button";
import { CartItemEntity } from "@/features/cart/entities/cart.entity";
import { useEffect, useRef, useState } from "react";
import Quantity from "@/components/quantity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateQuantity } from "@/store/slices/cartSlice";

export default function CartItem({
  checkboxList,
  onCheckboxChange,
  item,
}: {
  checkboxList: number[];
  onCheckboxChange: (variantId: number) => void;
  item: CartItemEntity;
}) {
  const cartQuantity = useAppSelector((state) => state.cart.quantity);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const formatter = new Intl.NumberFormat("vi-VN");

  const [quantity, setQuantity] = useState<number>(item.Quantity);
  const prevQuantity = useRef(item.Quantity);

  const updateQueueRef = useRef<Promise<void>>(Promise.resolve());

  const changeItemQuantityMutation = useMutation({
    mutationFn: async (payload: { VariantID: number; Quantity: number }) => {
      return CartUsecase.changeItemQuantity(payload);
    },
    onMutate: async (payload) => {
      console.log("call onMutate ");
      const previousCartQuantity = cartQuantity;
      console.log("previousCartQuantity", previousCartQuantity);
      const oldQuantity = Number(prevQuantity.current);
      console.log("payload.Quantity", payload.Quantity);
      console.log("oldQuantity", oldQuantity);
      dispatch(
        updateQuantity(previousCartQuantity - oldQuantity + payload.Quantity),
      );
      const previousCart = queryClient.getQueryData(["cart-items"]);
      queryClient.setQueryData(["cart-items"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((i: CartItemEntity) =>
            i.VariantID === payload.VariantID
              ? { ...i, Quantity: payload.Quantity }
              : i,
          ),
        };
      });

      prevQuantity.current = payload.Quantity;

      return { previousCartQuantity, oldQuantity, previousCart };
    },
    onError: async (err, payload, context) => {
      if (context) {
        queryClient.setQueryData(["cart-items"], context.previousCart);
        dispatch(updateQuantity(context.previousCartQuantity));
        prevQuantity.current = context.oldQuantity;
        setQuantity(context.oldQuantity); // Khôi phục UI input
      }
      throw new Error("Error when changing quantity");
    },
    onSuccess: async (data) => {
      dispatch(updateQuantity(data.newQuantity!));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    },
  });

  const deleteCartItemMutation = useMutation({
    mutationFn: async (payload: { VariantID: number }) => {
      return CartUsecase.deleteCartItem(payload);
    },
  });

  // --- HANDLERS ---

  const handleUpdateCartAPI = (newQuantity: number) => {
    const oldQuantity = Number(prevQuantity.current);
    if (newQuantity === oldQuantity) {
      return;
    }
    updateQueueRef.current = updateQueueRef.current.then(async () => {
      try {
        changeItemQuantityMutation.mutate({
          VariantID: item.VariantID,
          Quantity: newQuantity,
        });
      } catch (error) {
        console.error("Lỗi cập nhật số lượng:", error);
        // Rollback prevQuantity khi lỗi
        prevQuantity.current = oldQuantity;
        // Rollback UI quantity
        setQuantity(oldQuantity);
      }
    });
  };

  const handleDeleteItem = async (VariantID: number) => {
    try {
      await deleteCartItemMutation
        .mutateAsync({ VariantID })
        .then(async (res) => {
          dispatch(updateQuantity(res.newQuantity!));
        });

      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    } catch (error) {
      console.error("Lỗi xóa item:", error);
    }
  };

  // --- RENDER ---
  return (
    <div
      key={item.VariantID} // Dùng VariantID hoặc CartItemID cho key
      className="flex flex-col lg:flex-row border-b pb-4 gap-10"
    >
      <div className="flex items-center">
        <Checkbox
          className="w-6 h-6 border-2 border-black"
          checked={checkboxList.includes(item.VariantID)}
          onCheckedChange={() => onCheckboxChange(item.VariantID)}
        />
      </div>

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
            onClick={() => handleDeleteItem(item.VariantID)}
            disabled={deleteCartItemMutation.isPending} // Disable nút khi đang xóa
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
