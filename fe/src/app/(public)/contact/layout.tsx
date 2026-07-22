import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JK Keyboard - Contact",
  description: "Contact Page",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
