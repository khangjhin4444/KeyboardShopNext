import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JK Keyboard - Search",
  description: "Search Product Page",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
