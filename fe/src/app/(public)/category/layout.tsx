import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "JK Keyboard - Category",
  description: "Product Page by Category",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
