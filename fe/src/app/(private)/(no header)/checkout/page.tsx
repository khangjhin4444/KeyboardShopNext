"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { CartItemEntity } from "@/features/cart/entities/cart.entity";

import { useSession } from "next-auth/react";
export default function Page() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const formatter = new Intl.NumberFormat("vi-VN");

  const user = session?.user;

  // Gọi API lấy giỏ hàng
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cart-items"],
    queryFn: () => CartUsecase.getCartItems(),
  });
  const cartItems: CartItemEntity[] = data?.items || [];

  // State lưu trữ thông tin form
  const [formData, setFormData] = useState({
    name: user?.Name || "",
    phone: user?.Phone || "",
    address: user?.Address || "",
    request: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"Fast" | "Normal">(
    "Fast",
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Banking">("COD");

  // Đồng bộ thông tin user vào form khi load xong
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.Name || "",
        phone: user.Phone || "",
        address: user.Address || "",
      }));
    }
  }, [user]);

  // Tính toán Tiền bạc
  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.Price * item.Quantity,
    0,
  );
  const shippingFee = shippingMethod === "Fast" ? 60000 : 30000;
  const grandTotal = subTotal + shippingFee;

  // Xử lý Ngày giao hàng dự kiến (Tính từ ngày hiện tại)
  const getEstimatedDate = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const placeOrderMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      phone: string;
      address: string;
      shipping: string;
      payment: string;
      total: number;
    }) => {
      return CartUsecase.placeOrder(payload); // Trả kết quả về cho onSuccess xử lý
    },
    onSuccess: async () => {
      await update({
        cartQuantity: 0,
      });
    },
  });

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please fill in all receiver information!");
      return;
    }

    const orderPayload = {
      ...formData,
      shipping: shippingMethod,
      payment: paymentMethod,
      total: grandTotal,
    };

    console.log("Submitting Order: ", orderPayload);
    const placeOrderPromise = placeOrderMutation
      .mutateAsync(orderPayload)
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message || "Failed to place order");
        }

        return res;
      });
    toast.promise(placeOrderPromise, {
      loading: "Processing...",
      success: (data) => {
        return data.message;
      },
      error: (err) => {
        return err.message;
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="animate-spin text-[#3B9AB8]" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi tải giỏ hàng để thanh toán!
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/logo.png"
            alt="Logo image"
            className="w-24 h-24 rounded-full shadow-sm cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push("/")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-2xl font-semibold mb-6">
                Receiver Information
              </h4>
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B9AB8]"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B9AB8]"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B9AB8]"
                    placeholder="Shipping Address"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Special request (Optional)
                  </label>
                  <textarea
                    value={formData.request}
                    onChange={(e) =>
                      setFormData({ ...formData, request: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B9AB8] h-28 resize-none"
                    placeholder="Leave a comment here"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Cột 2: Phương thức Vận chuyển & Thanh toán */}
            <div className="bg-gray-100 p-6 rounded-2xl shadow-sm h-fit">
              <h4 className="text-2xl font-semibold mb-6">Shipping Method</h4>

              {/* Option Vận chuyển nhanh */}
              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <input
                  type="radio"
                  name="shipping"
                  value="fast"
                  checked={shippingMethod === "Fast"}
                  onChange={() => setShippingMethod("Fast")}
                  className="mt-1 w-4 h-4 text-[#3B9AB8] focus:ring-[#3B9AB8]"
                />
                <div>
                  <div className="font-semibold text-lg group-hover:text-[#3B9AB8] transition">
                    Fast Shipping{" "}
                    <span className="text-red-500 ml-2">60.000 VND</span>
                  </div>
                  <p className="text-gray-600 text-sm">Receive in 2-3 days</p>
                  <p className="text-blue-600 font-medium">
                    Estimated: {getEstimatedDate(3)}
                  </p>
                </div>
              </label>

              {/* Option Vận chuyển thường */}
              <label className="flex items-start gap-3 cursor-pointer mb-8 group">
                <input
                  type="radio"
                  name="shipping"
                  value="normal"
                  checked={shippingMethod === "Normal"}
                  onChange={() => setShippingMethod("Normal")}
                  className="mt-1 w-4 h-4 text-[#3B9AB8] focus:ring-[#3B9AB8]"
                />
                <div>
                  <div className="font-semibold text-lg group-hover:text-[#3B9AB8] transition">
                    Normal Shipping{" "}
                    <span className="text-red-500 ml-2">30.000 VND</span>
                  </div>
                  <p className="text-gray-600 text-sm">Receive in 5-7 days</p>
                  <p className="text-blue-600 font-medium">
                    Estimated: {getEstimatedDate(7)}
                  </p>
                </div>
              </label>

              <h4 className="text-2xl font-semibold mb-4 border-t pt-6 border-gray-300">
                Payment Method
              </h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-4 h-4 text-[#3B9AB8] focus:ring-[#3B9AB8]"
                  />
                  <span className="font-medium text-lg">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="banking"
                    checked={paymentMethod === "Banking"}
                    onChange={() => setPaymentMethod("Banking")}
                    className="w-4 h-4 text-[#3B9AB8] focus:ring-[#3B9AB8]"
                  />
                  <span className="font-medium text-lg">Internet Banking</span>
                </label>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: GIỎ HÀNG VÀ TỔNG TIỀN ================= */}
          <div className="lg:col-span-1">
            <div className="flex items-end gap-2 mb-6">
              <h4 className="text-2xl font-bold">Cart</h4>
              <span className="text-xl text-gray-500">
                ({cartItems.length} Products)
              </span>
            </div>

            {/* Danh sách sản phẩm cuộn được */}
            <div className="max-h-95 overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-thumb-gray-300">
              {cartItems.map((item) => (
                <div
                  key={item.VariantID}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.MainImage}
                      alt={item.Name}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-200 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold border border-white">
                      {item.Quantity}
                    </div>
                  </div>

                  <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-1 w-2/3">
                      <h6 className="font-semibold line-clamp-2 leading-tight">
                        {item.Name}
                      </h6>
                      <h6 className="text-gray-500 text-sm">{item.Color}</h6>
                    </div>
                    <div className="w-1/3 text-right">
                      <h6 className="text-red-500 font-bold">
                        {formatter.format(item.Quantity * item.Price)} VND
                      </h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hộp tính Tổng tiền */}
            <div className="mt-8 bg-gray-50 p-5 rounded-xl border shadow-sm flex flex-col gap-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatter.format(subTotal)} VND</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span>{formatter.format(shippingFee)} VND</span>
              </div>
              <div className="border-t mt-2 pt-3 flex justify-between items-center">
                <h4 className="text-xl font-bold">Total:</h4>
                <h4 className="text-2xl font-bold text-red-600">
                  {formatter.format(grandTotal)} VND
                </h4>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => router.push("/cart")}
                className="w-1/2 py-3 cursor-pointer px-2 border-2 border-black rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                BACK TO CART
              </button>
              <button
                onClick={handleOrder}
                className="w-1/2 py-3 px-2 cursor-pointer bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition"
              >
                ORDER NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
