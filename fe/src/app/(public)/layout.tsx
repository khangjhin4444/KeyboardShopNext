import Footer from "@/components/footer";
import Header from "@/components/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { div } from "framer-motion/client";
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider>
      <Header />
      <div className="flex-1">{children}</div>

      <Footer />
    </TooltipProvider>
  );
}
