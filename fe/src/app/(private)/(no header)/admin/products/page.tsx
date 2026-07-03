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
import ProductTable from "./_component/product-table";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <ProductTable type="KeyboardKit" />
      <ProductTable type="Prebuild" />
      <ProductTable type="Keycap" />
      <ProductTable type="Switch" />
    </div>
  );
}
