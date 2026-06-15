"use client";

import { SortAsc } from "lucide-react";
import Sorting from "./sorting";
import ProductGrid from "./product_grid";

export default function ProductList({ type }: { type: string }) {
  return (
    <div className="flex flex-col mt-10 px-[10%]">
      <h2 className="text-2xl font-bold text-center">{type}</h2>
      <Sorting />
      <ProductGrid type={type} />
    </div>
  );
}
