"use client";
import { Minus, Plus } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import clsx from "clsx";

// 1. Thêm prop onUpdateCart vào interface
interface QuantityProps {
  quantity: number | string;
  currentStock: number;
  setQuantity: Dispatch<SetStateAction<number | string>>;
  isCart: boolean;
  onUpdateCart?: (newQuantity: number) => void; // Hàm gọi API truyền từ bên ngoài vào
}

export default function Quantity({
  quantity,
  currentStock,
  setQuantity,
  isCart,
  onUpdateCart,
}: QuantityProps) {
  const isFirstRender = useRef(true);
  const initialQuantity = useRef(quantity);
  const onUpdateCartRef = useRef(onUpdateCart);
  useEffect(() => {
    onUpdateCartRef.current = onUpdateCart;
  }, [onUpdateCart]);
  const handleQuantityChange = (
    type: "decrease" | "increase" | "input",
    value?: string | number,
  ) => {
    if (type === "decrease") {
      setQuantity((prev) => Math.max(1, (Number(prev) || 1) - 1));
    }
    if (type === "increase") {
      setQuantity((prev) => {
        const current = Number(prev) || 1;
        return current < currentStock ? current + 1 : currentStock;
      });
    }
    if (type === "input" && value !== undefined) {
      if (value === "") {
        setQuantity("");
        return;
      }
      const numValue = parseInt(value.toString(), 10);
      if (isNaN(numValue)) return;
      if (numValue <= currentStock) {
        setQuantity(numValue);
      } else {
        setQuantity(currentStock);
      }
    }
  };

  useEffect(() => {
    if (quantity === initialQuantity.current) {
      return;
    }

    if (isCart && quantity !== "" && Number(quantity) >= 1) {
      const handler = setTimeout(() => {
        // Sử dụng hàm từ Ref thay vì dùng trực tiếp biến onUpdateCart
        if (onUpdateCartRef.current) {
          onUpdateCartRef.current(Number(quantity));
        }
      }, 400);

      return () => {
        clearTimeout(handler);
      };
    }

    // 3. ĐIỂM CHỐT HẠ: Xóa onUpdateCart ra khỏi dependency array!
    // Giờ đây useEffect chỉ bị kích hoạt DUY NHẤT khi biến 'quantity' thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, isCart]);

  return (
    <div className="flex items-center mb-10">
      <div className={clsx("mr-10", isCart ? "text-lg" : "text-2xl")}>
        Quantity:
      </div>
      <div className="flex items-center overflow-hidden">
        <button
          onClick={() => handleQuantityChange("decrease")}
          className={clsx(
            "px-4 py-2 cursor-pointer",
            isCart ? "text-lg" : " text-5xl",
          )}
        >
          <Minus />
        </button>
        <input
          type="number"
          max={currentStock}
          value={quantity}
          onChange={(e) => handleQuantityChange("input", e.target.value)}
          onBlur={() => {
            if (quantity === "" || Number(quantity) < 1) {
              setQuantity(1);
            }
          }}
          className={clsx(
            "w-20 text-center  outline-none py-2",
            isCart ? "text-lg" : "text-2xl",
          )}
        />
        <button
          onClick={() => handleQuantityChange("increase")}
          className={clsx(
            "px-4 py-2 cursor-pointer",
            isCart ? "text-lg" : " text-5xl",
          )}
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}
