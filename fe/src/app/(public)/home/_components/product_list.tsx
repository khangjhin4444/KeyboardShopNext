"use client";

import { motion } from "framer-motion";
import ProductGrid from "./product_grid";

export default function ProductList({ type }: { type: string }) {
  return (
    <motion.div
      className="flex flex-col mt-15 px-[10%]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-3xl font-bold text-center">
        {type !== "KeyboardKit" ? type : "Keyboard Kit"}
      </h2>

      <ProductGrid type={type} />
    </motion.div>
  );
}
