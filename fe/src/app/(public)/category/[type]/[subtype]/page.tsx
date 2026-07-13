"use client";
import ProductList from "@/app/(public)/category/_component/product_list";
import { use } from "react";

export default function Page({
  params,
}: {
  // Khai báo params là một Promise
  params: Promise<{ type: string; subtype: string }>;
}) {
  const resolvedParams = use(params);
  const { type, subtype } = resolvedParams;
  const decodedSubtype = decodeURIComponent(subtype);
  return <ProductList type={type} sub={decodedSubtype} />;
}
