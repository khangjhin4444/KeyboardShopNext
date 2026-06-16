import React, { useState, useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ProductUsecase } from "@/features/products/usecase/products.usecase";
import { LoaderCircle } from "lucide-react";
import { clsx } from "clsx";
import { useInView } from "react-intersection-observer";
import { ProductSkeleton } from "./product_skeletion";
export default function ProductGrid({ type }: { type: string }) {
  const formatter = new Intl.NumberFormat("vi-VN");
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ kích hoạt 1 lần duy nhất khi nhìn thấy
    rootMargin: "300px 0px", // Khách cuộn gần tới nơi cách 200px là đã âm thầm load trước
  });
  const {
    data,
    fetchNextPage, // Hàm kích hoạt gọi trang tiếp theo (gọi khi bấm nút Load More)
    hasNextPage, // Biến boolean kiểm tra xem còn trang kế tiếp không
    isFetchingNextPage, // Trạng thái đang tải trang tiếp theo
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["infinite-products", type],

    queryFn: ({ pageParam = 1 }) =>
      ProductUsecase.getProducts({ type, page: pageParam }),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 8) return undefined;

      return allPages.length + 1;
    },
    enabled: inView,
  });
  const handleLoadMore = () => {};
  return (
    <div ref={ref}>
      {!inView || isLoading ? (
        <div>
          <ProductSkeleton />
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10 ">
            {data?.pages.map((page, index) => (
              <React.Fragment key={index}>
                {page.map((product) => (
                  <Card
                    key={product.ProductID}
                    className="relative mx-auto w-full  max-w-sm pt-0"
                  >
                    <div className="absolute inset-0 z-30 aspect-square" />
                    <img
                      src={product.MainImage}
                      alt="Product Image"
                      className="relative z-20 aspect-square w-full object-cover "
                    />
                    <CardHeader>
                      <CardTitle className="h-12">{product.Name}</CardTitle>
                      <CardDescription className="text-center font-semibold text-[#7c5c2c]">
                        Price: {formatter.format(product.Price)} VND
                      </CardDescription>
                      <Button className="w-full bg-[#8CC0EB] hover:bg-[#BFDDF0] mt-5">
                        View More
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div
            className={clsx({
              hidden: !hasNextPage,
            })}
          >
            <div className="flex flex-row justify-center items-center w-full mt-10 mb-10">
              <Button
                className="cursor-pointer bg-gray-400 text-lg p-4"
                // onClick={handleLoadMore()}
              >
                Load more
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
