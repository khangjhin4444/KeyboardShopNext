import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "Admin Orders Page",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
