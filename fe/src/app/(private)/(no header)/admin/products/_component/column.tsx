"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ProductDetailEntity } from "@/features/admin/entities/admin.entity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Check, Trash2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";

const options = [
  { type: "Prebuild", sub: ["75%", "Full Size", "TKL", "Alice"] },
  {
    type: "KeyboardKit",
    sub: ["75%", "Full Size", "TKL", "Alice"],
  },
  { type: "Keycap", sub: ["Cherry", "MDA", "Artisan", "SA"] },
  {
    type: "Switch",
    sub: ["Clicky", "Linear", "Tactile", "Silent"],
  },
];

const EditableCell = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue();
  const meta = table.options.meta as any;
  const isEditing = meta?.editingRow === row.id;

  // Lấy dữ liệu tạm thời (nếu đang sửa) hoặc dùng dữ liệu gốc
  const value = isEditing
    ? (meta?.editData?.[column.id] ?? initialValue)
    : initialValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    meta?.updateEditData(column.id, e.target.value);
  };

  if (isEditing) {
    const isNumberField = column.id === "Price" || column.id === "Stock";
    if (column.id === "ProductType") {
      return (
        <Select
          value={value}
          onValueChange={(val) => meta?.updateEditData(column.id, val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selec type" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => {
              return (
                <SelectItem key={opt.type} value={opt.type}>
                  {opt.type}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    }
    if (column.id === "SubType") {
      const currentProductType =
        meta?.editData?.ProductType ?? row.original.ProductType;

      const availableSubTypes =
        options.find((opt) => opt.type === currentProductType)?.sub || [];

      return (
        <Select
          value={value}
          onValueChange={(val) => meta?.updateEditData(column.id, val)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select sub type" />
          </SelectTrigger>
          <SelectContent>
            {availableSubTypes.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        value={value}
        onChange={handleChange}
        type={isNumberField ? "number" : "text"}
        className="h-8 py-1 px-2 text-sm w-full min-w-[80px]"
      />
    );
  }

  // Formatting cho cột Giá tiền khi ở chế độ hiển thị bình thường
  if (column.id === "Price") {
    const amount = parseInt(initialValue || 0);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  return <span className="truncate">{initialValue}</span>;
};

interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  timeout?: number;
}

const ConfirmDeleteButton = ({
  onConfirm,
  timeout = 3000,
}: ConfirmDeleteButtonProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      timerRef.current = setTimeout(() => {
        setIsConfirming(false);
      }, timeout);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsConfirming(false);
      onConfirm();
    }
  };
  return (
    <Button
      size="sm"
      variant={isConfirming ? "destructive" : "secondary"}
      onClick={handleClick}
      className={`transition-all duration-300 w-[90px] h-8 ${
        isConfirming ? "animate-pulse bg-red-600 text-white" : ""
      }`}
    >
      {isConfirming ? (
        <>
          <AlertTriangle className="w-4 h-4 mr-1" /> Sure?
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </>
      )}
    </Button>
  );
};

export const columns: ColumnDef<ProductDetailEntity>[] = [
  { accessorKey: "Name", header: "Name", cell: EditableCell },
  { accessorKey: "ProductType", header: "Product Type", cell: EditableCell },
  { accessorKey: "SubType", header: "Sub Type", cell: EditableCell },
  { accessorKey: "Color", header: "Variant", cell: EditableCell },
  { accessorKey: "Price", header: "Price", cell: EditableCell },
  { accessorKey: "Stock", header: "Stock", cell: EditableCell },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const isEditing = meta?.editingRow === row.id;

      if (isEditing) {
        return (
          <div className="flex justify-end items-end gap-2">
            <Button
              size="sm"
              className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => meta?.saveRow(row.id)}
            >
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              onClick={meta?.cancelEdit}
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        );
      }

      return (
        <div className="flex justify-end items-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8"
            onClick={() => meta?.startEdit(row.id, row.original)}
          >
            Edit
          </Button>
          <ConfirmDeleteButton
            onConfirm={() => {
              if (meta?.deleteRow) {
                meta.deleteRow(row.original.VariantID);
              }
            }}
          />
        </div>
      );
    },
  },
];
