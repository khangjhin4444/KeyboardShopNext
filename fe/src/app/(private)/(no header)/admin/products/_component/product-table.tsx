"use client";
import { AdminUsecase } from "@/features/admin/usecase/admin.usecase";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ProductFormDialog } from "./ProductFormDialog";

function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header Skeleton (Tiêu đề & Nút Add) */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>

      {/* Datatable Skeleton */}
      <div className="rounded-md border overflow-hidden">
        {/* Table Header (Hàng tiêu đề cột) */}
        <div className="border-b px-4 py-3 bg-muted/30 flex gap-4">
          <Skeleton className="h-5 w-1/5" />
          <Skeleton className="h-5 w-1/5" />
          <Skeleton className="h-5 w-1/5" />
          <Skeleton className="h-5 w-1/5" />
          <Skeleton className="h-5 w-1/5" />
        </div>

        {/* Table Body (Tạo 5 hàng giả lập) */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 border-b last:border-0 flex gap-4 items-center"
          >
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />

            {/* Cột Action (mô phỏng 2 nút Edit & Delete) */}
            <div className="flex gap-2 w-1/5 justify-end">
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-8 w-[70px]" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-9 w-[80px]" />
        <Skeleton className="h-9 w-[80px]" />
      </div>
    </div>
  );
}

export default function ProductTable({ type }: { type: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const qc = useQueryClient();
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ kích hoạt 1 lần duy nhất khi nhìn thấy
    rootMargin: "300px 0px", // Khách cuộn gần tới nơi cách 200px là đã âm thầm load trước
  });
  const {
    data: products,
    fetchNextPage, // Hàm kích hoạt gọi trang tiếp theo (gọi khi bấm nút Load More)
    hasNextPage, // Biến boolean kiểm tra xem còn trang kế tiếp không
    isFetchingNextPage, // Trạng thái đang tải trang tiếp theo
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["products-table", type],

    queryFn: ({ pageParam = 1 }) =>
      AdminUsecase.getProductDetail({ page: pageParam, type }),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 8) return undefined;

      return allPages.length + 1;
    },
    enabled: inView,
  });
  return (
    <div ref={ref}>
      {!inView || isLoading ? (
        <TableSkeleton />
      ) : (
        <div>
          <div className="flex justify-between">
            <h2 className="font-bold text-xl mb-4">
              {type === "KeyboardKit" ? "Keyboard Kit" : type}
            </h2>
            <Button
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              <span>
                <Plus />
              </span>
              Add Product
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={products?.pages.flat() || []}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      )}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={(type: string) => {
          console.log(type);
          qc.invalidateQueries({ queryKey: ["products-table", type] });
        }}
      />
    </div>
  );
}
