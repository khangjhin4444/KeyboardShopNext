import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JK Keyboard - About",
  description: "About Page",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
