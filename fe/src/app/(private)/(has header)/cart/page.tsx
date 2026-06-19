"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CartItemEntity } from "@/features/cart/entities/cart.entity";
import CartItem from "./cartItem";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { useEffect, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const formatter = new Intl.NumberFormat("vi-VN");
  const [subTotals, setSubTotals] = useState<Record<number, number>>({});
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["cart-items"],
    queryFn: () => CartUsecase.getCartItems(),
  });
  const cartItems = data?.items || [];
  useEffect(() => {
    cartItems.forEach((item: CartItemEntity) => {
      setSubTotals((prev) => ({
        ...prev,
        [item.VariantID]: item.Price * item.Quantity,
      }));
    });
  }, [cartItems]);

  // UI khi đang tải
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="animate-spin text-[#3B9AB8]" size={48} />
      </div>
    );
  }

  // UI khi lỗi (không phải lỗi hết session)
  if (isError && error?.message !== "SESSION_EXPIRED") {
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi tải giỏ hàng: {error.message}
      </div>
    );
  }
  const grandTotal = Object.values(subTotals).reduce(
    (sum, val) => sum + val,
    0,
  );
  console.log(subTotals);
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
              item={item}
              key={item.CartItemID}
              onUpdateSubTotal={handleUpdateSubTotal}
            />
          ))}
          <div className="fixed z-100 bottom-10 right-20 flex flex-col gap-3 justify-center mt-8 border-2 bg-white p-5 rounded-4xl">
            <div className="font-bold text-xl text-green-600">
              Total: {formatter.format(grandTotal)} VND
            </div>

            <button className="bg-[#3B9AB8] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition cursor-pointer">
              Process Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
