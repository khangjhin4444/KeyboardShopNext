"use client";

import ProductGrid from "./product_grid";

export default function ProductList({
  type,
  sub,
}: {
  type: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col mt-15 px-[10%]">
      <h2 className="text-3xl font-bold text-center">{sub}</h2>

      <ProductGrid type={type} sub={sub} />
    </div>
  );
}
