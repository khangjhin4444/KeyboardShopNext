"use client";

import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { clsx } from "clsx";

import { Button } from "@/components/ui/button";
import { ProductUsecase } from "@/features/products/usecase/products.usecase";
import { ProductSkeleton } from "./product_skeletion";
import Sorting from "./sorting";
import { ProductCard } from "./product_card";

export default function ProductGrid({ type }: { type: string }) {
  const [sort, setSort] = useState("default");

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px 0px",
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["infinite-products", type, sort],
      queryFn: ({ pageParam = 1 }) =>
        ProductUsecase.getProducts({ type, page: pageParam, sort }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 8) return undefined;
        return allPages.length + 1;
      },
      enabled: inView,
    });

  const handleSortChange = (sortOpt: string) => {
    setSort(sortOpt);
  };

  return (
    <div ref={ref} className="w-full">
      <Sorting onSortChange={handleSortChange} />

      {!inView || isLoading ? (
        <div className="mt-10">
          <ProductSkeleton />
        </div>
      ) : (
        <div className="w-full">
          {/* Lưới sản phẩm siêu gọn gàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10 justify-items-center">
            {data?.pages.map((page, pageIndex) => (
              <React.Fragment key={`page-${pageIndex}`}>
                {page.map((product: any) => (
                  // Truyền toàn bộ dữ liệu product vào Card
                  <ProductCard key={product.ProductID} product={product} />
                ))}
              </React.Fragment>
            ))}

            {/* Skeleton Loading khi tải trang tiếp theo */}
            {isFetchingNextPage && (
              <React.Fragment>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`load-more-skeleton-${idx}`}
                    className="w-full max-w-sm opacity-70"
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="aspect-square w-full bg-gray-200 rounded-xl dark:bg-gray-700" />
                      <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto dark:bg-gray-700" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </React.Fragment>
            )}
          </div>

          {/* Nút Load More */}
          <div
            className={clsx(
              "flex flex-row justify-center items-center w-full mt-12 mb-10",
              {
                hidden: !hasNextPage,
              },
            )}
          >
            <Button
              className="cursor-pointer bg-gray-400 text-lg p-4"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
