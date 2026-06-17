"use client";
import { CartUsecase } from "@/features/cart/usecase/cart.usecase";
import { Variant } from "@/features/products/entities/product.entity";
import { ProductUsecase } from "@/features/products/usecase/products.usecase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { variantPriorityOrder } from "motion";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";

export default function Page() {
  const updateCartQuantity = useUserStore((state) => state.updateCartQuantity);
  const currentQuantity = useUserStore(
    (state) => state.user?.cartQuantity || 0,
  );
  const params = useParams();
  const productID = parseInt(params.id as string, 10);
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["product_by_id", productID],
    queryFn: () => ProductUsecase.getProductDetail(productID),
  });
  const { data: relevantProducts, isLoading: isRelevantLoading } = useQuery({
    queryKey: ["relevant", data?.ProductType],
    queryFn: () =>
      ProductUsecase.getRelevantProducts(data?.ProductID!, data?.ProductType!),
    enabled: !!data?.ProductType,
  });

  const [activeVariant, setActiveVariant] = useState<Variant | null>(null);
  const [mainImage, setMainImage] = useState<string>("temp");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [zoom, setZoom] = useState({ show: false, x: 0, y: 0 });
  const addToCartMutation = useMutation({
    mutationFn: async (payload: { VariantID: number; Quantity: number }) => {
      return CartUsecase.addToCart(payload); // Trả kết quả về cho onSuccess xử lý
    },
  });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoom({ show: true, x, y });
  };
  useEffect(() => {
    if (data && data.variants && data.variants.length > 0) {
      const uniqueVariants = data.variants.reduce(
        (acc: Variant[], current: Variant) => {
          if (!acc.find((v) => v.Color === current.Color)) {
            acc.push(current);
          }
          return acc;
        },
        [],
      );

      const defaultVariant =
        uniqueVariants.find((v: Variant) => v.Stock > 0) || uniqueVariants[0];

      setActiveVariant(defaultVariant);
      setMainImage(defaultVariant?.MainImage || data.images[0]);
    }
  }, [data]);

  useEffect(() => {
    if (activeVariant) {
      setMainImage(activeVariant.MainImage);
    }
  }, [activeVariant]);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading Product...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Can not load Product!
      </div>
    );
  }
  const uniqueVariants = data?.variants.reduce((acc: Variant[], current) => {
    if (!acc.find((v) => v.Color === current.Color)) {
      acc.push(current);
    }
    return acc;
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "VND";
  };

  const handleQuantityChange = (
    type: "decrease" | "increase" | "input",
    value?: string | number, // Nhận thêm kiểu string
  ) => {
    const currentStock = activeVariant?.Stock || 0;

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

  const handleAddToCart = () => {
    if (!activeVariant) {
      toast("Choose a variant");
      return;
    }

    const qty = Number(quantity);

    if (isNaN(qty) || qty < 1) {
      setQuantity(1); // Ép về 1
      return;
    }
    const addToCartPromise = addToCartMutation
      .mutateAsync({
        VariantID: activeVariant.VariantID,
        Quantity: qty,
      })
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message || "Lỗi khi thêm vào giỏ hàng");
        }

        updateCartQuantity(Number(currentQuantity) + Number(qty));
        return res;
      });

    toast.promise(addToCartPromise, {
      loading: "Adding to Cart...",
      success: (data) => {
        return data.message;
      },
      error: (err) => {
        return err.message;
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      {/* --- PHẦN 1: THÔNG TIN CHÍNH & MUA HÀNG --- */}
      <section className="flex flex-col md:flex-row gap-10">
        {/* Cột trái: Hình ảnh */}
        <div className="md:w-1/2">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-125 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <div
                className="relative w-full h-full  border rounded-lg overflow-hidden bg-gray-50 cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoom({ show: false, x: 0, y: 0 })}
              >
                <img
                  src={mainImage}
                  alt="Main Product"
                  className={`w-full h-full object-fill transition-opacity duration-600 ${
                    zoom.show ? "opacity-80" : "opacity-100"
                  }`}
                />

                {zoom.show && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${mainImage})`,
                      backgroundSize: "200%",
                      backgroundRepeat: "no-repeat",
                      // Dịch chuyển background khớp với tọa độ chuột
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Danh sách ảnh thu nhỏ (Thumbnails) */}
            <div className="flex gap-3 overflow-x-auto w-full py-2 px-1 scrollbar-hide snap-x">
              {data.images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="snap-start shrink-0"
                  onClick={() => setMainImage(imgUrl)} // Click thumbnail -> Đổi ảnh chính
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index}`}
                    className={`w-20 h-20 md:w-24 md:h-24 object-cover rounded-md cursor-pointer border-2 transition-all ${
                      mainImage === imgUrl
                        ? "border-red-500 opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:w-1/2 text-left">
          <h1 className="text-4xl font-bold mb-4">{data.Name}</h1>
          <h2 className="text-3xl text-red-600 font-semibold mb-6">
            {formatCurrency(activeVariant?.Price || 0)}
          </h2>

          {uniqueVariants.length > 0 && uniqueVariants[0].Color !== "Basic" && (
            <div className="mb-8">
              <div className="text-2xl mb-4 flex items-center gap-4">
                Variants:
                <span className="text-xl font-bold">
                  Stock: {activeVariant?.Stock || 0}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {uniqueVariants.map((variant, index) => (
                  <button
                    key={index}
                    disabled={variant.Stock <= 0}
                    onClick={() => setActiveVariant(variant)}
                    className={`px-4 py-2 w-32 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeVariant?.VariantID === variant.VariantID
                        ? "border-[#3B9AB8] bg-blue-50 text-[#3B9AB8] font-bold"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {variant.Color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chọn số lượng */}
          <div className="flex items-center mb-10">
            <div className="text-2xl mr-10">Quantity:</div>
            <div className="flex items-center  overflow-hidden">
              <button
                onClick={() => handleQuantityChange("decrease")}
                className="px-4 py-2 text-5xl cursor-pointer"
              >
                <Minus />
              </button>
              <input
                type="number"
                max={activeVariant?.Stock}
                value={quantity}
                onChange={(e) => handleQuantityChange("input", e.target.value)}
                onBlur={() => {
                  if (quantity === "" || Number(quantity) < 1) {
                    setQuantity(1);
                  }
                }}
                className="w-20 text-center text-2xl outline-none  py-2"
                // min="1"
              />
              <button
                onClick={() => handleQuantityChange("increase")}
                className="px-4 py-2 text-5xl cursor-pointer"
              >
                <Plus />
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col xl:flex-row gap-4">
            <button
              onClick={() => handleAddToCart()}
              className="flex-1 cursor-pointer bg-white text-[#3B9AB8] border-2 border-[#3B9AB8] px-8 py-4 rounded-lg font-bold text-xl hover:bg-blue-50 transition-all"
            >
              ADD TO CART
            </button>
            <button className="flex-1 cursor-pointer bg-[#3B9AB8] text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-[#2f7a93] transition-all">
              BUY NOW
            </button>
          </div>
        </div>
      </section>

      {/* --- PHẦN 2: MÔ TẢ CHI TIẾT --- */}
      <section className="mt-20">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Cột trái: Nội dung mô tả */}
          <div className="md:w-2/3 text-left">
            <h2 className="text-3xl font-bold text-center mb-8">{data.Name}</h2>

            <div className="text-xl font-semibold mb-4">
              Product Information
            </div>

            {/* Render Description giữ nguyên format xuống dòng */}
            <div className="text-gray-700 leading-relaxed space-y-2">
              {data.Description.split("\n").map((line, idx) => (
                <p key={idx}>
                  {line.trim().startsWith("-") ? (
                    <span className="ml-4">{line}</span>
                  ) : (
                    line
                  )}
                </p>
              ))}
              {/* {data.Description} */}
            </div>

            {/* Note: Logic Soundtest của PHP đã bị lược bỏ do 'Soundtest' không còn trong ProductDetailEntity */}
          </div>

          {/* Cột phải: Sản phẩm liên quan (Giao diện giữ chỗ) */}
          <div className="md:w-1/3">
            <h3 className="text-2xl font-bold mb-6">Relevant Products</h3>

            <div className="space-y-4">
              {isRelevantLoading && (
                <div className="flex gap-4 p-3 rounded-lg border animate-pulse">
                  <div className="w-24 h-24 shrink-0 bg-gray-200 rounded-md"></div>
                  <div className="flex flex-col justify-center gap-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              )}

              {relevantProducts && relevantProducts.length > 0
                ? relevantProducts.map((relProduct: any) => (
                    <div
                      key={relProduct.ProductID}
                      onClick={() =>
                        (window.location.href = `/product/${relProduct.ProductID}`)
                      }
                      className="flex gap-4 p-3 rounded-lg border hover:shadow-2xl cursor-pointer transition-all bg-white"
                    >
                      <div className="w-24 h-24 shrink-0 bg-gray-50 rounded-md overflow-hidden border">
                        <img
                          src={relProduct.MainImage}
                          alt={relProduct.Name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="font-semibold text-lg line-clamp-2">
                          {relProduct.Name}
                        </div>
                        <div className="text-red-600 font-bold mt-1">
                          {formatCurrency(relProduct.Price)}
                        </div>
                      </div>
                    </div>
                  ))
                : // Nếu fetch xong mà mảng rỗng (không có SP liên quan)
                  !isRelevantLoading && (
                    <div className="text-gray-500 italic">
                      No relevant products found.
                    </div>
                  )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
