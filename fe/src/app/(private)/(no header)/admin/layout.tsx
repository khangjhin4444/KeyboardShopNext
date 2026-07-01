import React from "react";
import { AdminSidebar } from "./_component/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <header className="h-14 flex items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-sm font-medium text-muted-foreground">Admin</h1>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
