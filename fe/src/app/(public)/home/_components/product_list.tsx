"use client";

import ProductGrid from "./product_grid";

export default function ProductList({ type }: { type: string }) {
  return (
    <div className="flex flex-col mt-15 px-[10%]">
      <h2 className="text-3xl font-bold text-center">
        {type !== "KeyboardKit" ? type : "Keyboard Kit"}
      </h2>

      <ProductGrid type={type} />
    </div>
  );
}
