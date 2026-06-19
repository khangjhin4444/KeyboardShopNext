import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "JK Keyboard - Cart",
  description: "Cart Page",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
