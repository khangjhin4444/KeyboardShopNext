"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CartItemEntity } from "@/features/cart/entities/cart.entity";
import CartItem from "./cartItem";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const formatter = new Intl.NumberFormat("vi-VN");
  const [subTotals, setSubTotals] = useState<Record<number, number>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const initializedVariantsRef = useRef(new Set<number>());

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart-items"],
    queryFn: () => CartUsecase.getCartItems(),
  });
  const cartItems = data?.items || [];

  useEffect(() => {
    if (cartItems.length > 0) {
      const newVariants = cartItems.filter(
        (item: CartItemEntity) => !initializedVariantsRef.current.has(item.VariantID)
      );

      if (newVariants.length > 0) {
        const newVariantIds = newVariants.map((item: CartItemEntity) => item.VariantID);
        
        setSelectedIds((prev) => [...prev, ...newVariantIds]);
        
        newVariantIds.forEach((id) => initializedVariantsRef.current.add(id));
      }
    }
  }, [cartItems]);

  // UI khi đang tải
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="animate-spin text-[#3B9AB8]" size={48} />
      </div>
    );
  }

  const handleCheckboxChange = (variantId: number) => {
    setSelectedIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId],
    );
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one item to checkout.");
      return;
    }
    const itemsToCheckout = cartItems.filter((item) =>
      selectedIds.includes(item.VariantID),
    );
    sessionStorage.setItem("checkout_session", JSON.stringify(itemsToCheckout));

    router.push("/checkout");
  };

  // UI khi lỗi (không phải lỗi hết session)
  if (isError && error?.message !== "SESSION_EXPIRED") {
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi tải giỏ hàng: {error.message}
      </div>
    );
  }
  const grandTotal = cartItems.reduce((sum, item) => {
    if (selectedIds.includes(item.VariantID)) {
      return sum + (subTotals[item.VariantID] || 0);
    }
    return sum;
  }, 0);
  const handleUpdateSubTotal = (VariantId: number, TotalAmount: number) => {
    setSubTotals((prev) => ({
      ...prev,
      [VariantId]: TotalAmount, // Cập nhật hoặc thêm mới số tiền của item này
    }));
  };
  return (
    <div className="py-10 px-35 relative">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 py-20 border-2 border-dashed rounded-lg">
          Empty Cart. Remember to click Add to Cart button!
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item: CartItemEntity) => (
            <CartItem
              checkboxList={selectedIds}
              onCheckboxChange={handleCheckboxChange}
              item={item}
              key={item.CartItemID}
              onUpdateSubTotal={handleUpdateSubTotal}
            />
          ))}
          <div className="fixed z-100 bottom-10 right-20 flex flex-col gap-3 justify-center mt-8 border-2 bg-white p-5 rounded-4xl">
            <div className="font-bold text-xl text-green-600">
              Total: {formatter.format(grandTotal)} VND
            </div>

            <button
              onClick={handleCheckout}
              className="bg-[#3B9AB8] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition cursor-pointer"
            >
              Process Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
