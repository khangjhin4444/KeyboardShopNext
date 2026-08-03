"use client";
import { Button } from "@/components/ui/button";
import { CartItemEntity } from "@/features/cart/entities/cart.entity";
import { useEffect, useRef, useState } from "react";
import Quantity from "@/components/quantity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";

export default function CartItem({
  checkboxList,
  onCheckboxChange,
  item,
  onUpdateSubTotal,
}: {
  checkboxList: number[];
  onCheckboxChange: (variantId: number) => void;
  item: CartItemEntity;
  onUpdateSubTotal: (VariantID: number, TotalAmount: number) => void;
}) {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const formatter = new Intl.NumberFormat("vi-VN");

  const [quantity, setQuantity] = useState<number | string>(item.Quantity);
  const prevQuantity = useRef(item.Quantity);

  // Dùng ref để luôn lấy giá trị cartQuantity mới nhất, tránh stale closure
  const cartQuantityRef = useRef(session?.user?.cartQuantity || 0);
  useEffect(() => {
    cartQuantityRef.current = session?.user?.cartQuantity || 0;
  }, [session?.user?.cartQuantity]);

  // Queue đảm bảo các lần gọi API chạy tuần tự, không song song
  const updateQueueRef = useRef<Promise<void>>(Promise.resolve());

  const changeItemQuantityMutation = useMutation({
    mutationFn: async (payload: { VariantID: number; Quantity: number }) => {
      return CartUsecase.changeItemQuantity(payload);
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
    const delta = newQuantity - oldQuantity;
    // Cập nhật prevQuantity ngay để các lần click tiếp theo tính delta đúng
    prevQuantity.current = newQuantity;

    // Chain vào queue: lần gọi mới luôn đợi lần trước xong
    updateQueueRef.current = updateQueueRef.current.then(async () => {
      try {
        await changeItemQuantityMutation
          .mutateAsync({
            VariantID: item.VariantID,
            Quantity: newQuantity,
          })
          .then(async (res) => {
            await update({
              cartQuantity: res.newQuantity,
            });
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
          await update({
            cartQuantity: res.newQuantity,
          });
        });

      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    } catch (error) {
      console.error("Lỗi xóa item:", error);
    }
  };

  useEffect(() => {
    if (quantity !== "") {
      onUpdateSubTotal(item.VariantID, Number(quantity) * item.Price);
    }
  }, [quantity]);

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
