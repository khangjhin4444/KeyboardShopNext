"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
// Import hàm lấy mã màu bạn đã tạo ở bước trước (đường dẫn tùy theo project của bạn)
import { getHexColor } from "@/utils/colors";
import { SimpleVariant } from "@/features/products/entities/product.entity";

export interface ProductType {
  ProductID: string;
  Name: string;
  MainImage: string;
  Price: number;
  variants?: SimpleVariant[];
}

export function ProductCard({ product }: { product: ProductType }) {
  const router = useRouter();
  const formatter = new Intl.NumberFormat("vi-VN");

  // Khởi tạo state: Nếu có variants thì lấy cái đầu tiên làm mặc định, nếu không thì null
  const [selectedVariant, setSelectedVariant] = useState<SimpleVariant | null>(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null,
  );

  // Dữ liệu hiển thị thực tế (Ưu tiên variant đang chọn, nếu không có thì lấy dữ liệu gốc của product)
  const displayImage = selectedVariant
    ? selectedVariant.image
    : product.MainImage;
  const displayPrice = selectedVariant ? selectedVariant.price : product.Price;

  // Hàm chuyển hướng
  const navigateToDetail = () => {
    router.push(`/product/${product.ProductID}`);
  };

  return (
    <Card className="relative mx-auto transition-all duration-300 hover:scale-[1.03] hover:shadow-xl w-full max-w-sm pt-0 flex flex-col justify-between overflow-hidden">
      <div
        className="relative z-10 aspect-square cursor-pointer bg-gray-50"
        onClick={navigateToDetail}
      >
        <img
          src={displayImage}
          alt={product.Name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      <CardHeader className="relative z-20 flex flex-col flex-1">
        <CardTitle
          className="h-12 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={navigateToDetail}
        >
          {product.Name}
        </CardTitle>
        {product.variants && product.variants.length > 0 && (
          <div className="flex justify-center items-center gap-2  min-h-[32px]">
            {product.variants.map((variant, index) => {
              const isSelected =
                selectedVariant?.colorText === variant.colorText;

              return (
                <button
                  key={`${product.ProductID}-${index}`}
                  title={variant.colorText} // Tooltip hiện tên màu khi hover
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài thẻ Card
                    setSelectedVariant(variant);
                  }}
                  className={clsx(
                    "w-6 h-6 rounded-full border border-gray-300 transition-all",
                    isSelected
                      ? "ring-2 ring-black ring-offset-2 scale-100"
                      : "hover:scale-110 opacity-80 hover:opacity-100",
                  )}
                  style={{
                    backgroundColor: getHexColor(variant.colorText),
                  }}
                />
              );
            })}
          </div>
        )}
        <CardDescription className="text-center font-semibold text-[#7c5c2c] text-lg mt-2">
          {formatter.format(displayPrice)} VND
        </CardDescription>

        {/* Nút điều hướng */}
        <Button
          className="cursor-pointer w-full bg-[#8CC0EB] hover:bg-[#BFDDF0] mt-5"
          onClick={(e) => {
            e.stopPropagation();
            navigateToDetail();
          }}
        >
          View More
        </Button>
      </CardHeader>
    </Card>
  );
}
