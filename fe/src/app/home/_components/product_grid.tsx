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

export default function ProductGrid({ type }: { type: string }) {
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
  });
  return isLoading ? (
    <div>
      Loading Products{" "}
      <span>
        <LoaderCircle />
      </span>
    </div>
  ) : (
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
                <CardTitle>{product.Name}</CardTitle>
                <CardDescription>Price: {product.Price}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">View More</Button>
              </CardFooter>
            </Card>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
