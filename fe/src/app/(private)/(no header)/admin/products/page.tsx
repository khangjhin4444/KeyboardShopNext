"use client";
import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminService } from "@/features/admin/services/admin.service";
import { AdminUsecase } from "@/features/admin/usecase/admin.usecase";
import { DataTable } from "../products/_component/data-table";
import { columns } from "../products/_component/column";
import { div } from "motion/react-m";

export default function Page() {
  const qc = useQueryClient();
  const {
    data: products,
    fetchNextPage, // Hàm kích hoạt gọi trang tiếp theo (gọi khi bấm nút Load More)
    hasNextPage, // Biến boolean kiểm tra xem còn trang kế tiếp không
    isFetchingNextPage, // Trạng thái đang tải trang tiếp theo
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["products-table"],

    queryFn: ({ pageParam = 1 }) => AdminUsecase.getProductDetail(pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 8) return undefined;

      return allPages.length + 1;
    },
  });
  console.log(products);
  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <DataTable
      columns={columns}
      data={products?.pages.flat() || []}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
