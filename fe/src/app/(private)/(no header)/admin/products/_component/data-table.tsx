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
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminUsecase } from "@/features/admin/usecase/admin.usecase";
import { toast } from "sonner";

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
type TableProduct = {
  ProductID: number;
  VariantID: number;
  Price: number;
  Stock: number;
  Color: string;
  ProductType: string;
  SubType: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: DataTableProps<TData, TValue>) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TableProduct>>({});
  const queryClient = useQueryClient();
  const [oldProductType, setOldProductType] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (VariantID: number) =>
      AdminUsecase.deleteProductAdmin({ VariantID: VariantID }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["products-table", data.type],
      });
    },
    onError: (error) => {
      console.error("Xóa thất bại:", error);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (payload: {
      VariantID: number;
      ProductID: number;
      Price: number;
      Stock: number;
      Color: string;
      ProductType: string;
      SubType: string;
    }) => AdminUsecase.updateProductVariantAdmin(payload),
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    meta: {
      editingRow,
      editData,
      startEdit: (rowId: string, rowData: TableProduct) => {
        setEditingRow(rowId);
        setEditData(rowData);
        setOldProductType(rowData.ProductType);
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
        setOldProductType(null);
        setEditData({});
      },
      saveRow: async (rowId: string) => {
        try {
          const payload = {
            VariantID: Number(editData.VariantID),
            ProductID: Number(editData.ProductID),
            Price: Number(editData.Price),
            Stock: Number(editData.Stock),
            Color: editData.Color || "",
            ProductType: editData.ProductType || "",
            SubType: editData.SubType || "",
          };
          const updatePromise = updateMutation.mutateAsync(payload, {
            onSuccess: (data) => {
              queryClient.invalidateQueries({
                queryKey: ["products-table", data.type],
              });
              if (oldProductType && oldProductType !== data.type) {
                queryClient.invalidateQueries({
                  queryKey: ["products-table", oldProductType],
                });
              }
              setEditingRow(null);
              setOldProductType(null);
              setEditData({});
            },
          });
          toast.promise(updatePromise, {
            loading: "Saving...",
            success: "Update successful",
            error: "Update failed!",
          });
        } catch (error) {
          console.error("Lỗi khi lưu:", error);
        }
      },
      deleteRow: async (variantId: string) => {
        try {
          const deleteMutaion = deleteMutation.mutateAsync(Number(variantId));
          toast.promise(deleteMutaion, {
            loading: "Deleting...",
            success: "Delete successful",
            error: "Delete failed!",
          });
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
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
      <div className="overflow-hidden rounded-md border pl-3 pr-3">
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
