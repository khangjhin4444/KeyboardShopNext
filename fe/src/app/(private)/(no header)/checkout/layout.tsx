import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "JK Keyboard - Checkout",
  description: "Checkout Page",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
