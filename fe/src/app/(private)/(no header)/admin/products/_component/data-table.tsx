"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDetailEntity } from "@/features/products/entities/product.entity";
import { useEffect, useState } from "react";
import { div } from "motion/react-client";
import { LoaderCircle } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const defaultVal = {
  KeyboardKit: "75%",
  Prebuild: "75%",
  Keycap: "Cherry",
  Switch: "Clicky",
};

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: DataTableProps<TData, TValue>) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProductDetailEntity>>({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    meta: {
      editingRow,
      editData,
      startEdit: (rowId: string, rowData: ProductDetailEntity) => {
        setEditingRow(rowId);
        setEditData(rowData);
      },
      updateEditData: (columnId: string, value: string) => {
        if (columnId === "ProductType") {
          setEditData((prev) => ({
            ...prev,
            ["SubType"]: defaultVal[value as keyof typeof defaultVal],
          }));
        }
        setEditData((prev) => ({ ...prev, [columnId]: value }));
      },
      cancelEdit: () => {
        setEditingRow(null);
        setEditData({});
      },
      saveRow: async (rowId: string) => {
        try {
          console.log("Đang gửi API với dữ liệu:", editData);
          // GỌI API PUT/PATCH CỦA BẠN Ở ĐÂY
          // await updateProductVariant(editData.VariantID, editData);

          // Sau khi lưu thành công, đóng chế độ edit
          setEditingRow(null);
          setEditData({});
          // Đừng quên gọi invalidateQueries để load lại bảng nhé
        } catch (error) {
          console.error("Lỗi khi lưu:", error);
        }
      },
    },
  });
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  useEffect(() => {
    if (pageIndex >= pageCount - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  }, [pageIndex, pageCount, hasNextPage, isFetchingNextPage, fetchNextPage]);
  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {isFetchingNextPage && (
          <span className="text-sm text-muted-foreground mr-4 flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading more...
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() && !hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
