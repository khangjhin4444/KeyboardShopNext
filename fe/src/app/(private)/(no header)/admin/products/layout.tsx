import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Products",
  description: "Admin Products Page",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
