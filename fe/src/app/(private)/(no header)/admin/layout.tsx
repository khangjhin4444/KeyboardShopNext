"use client";
import React from "react";
import { AdminSidebar } from "./_component/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <header className="h-14 flex items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-sm font-medium text-muted-foreground">Admin</h1>
          <div className="ml-auto">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 rounded-2xl p-2 border-2 cursor-pointer "
            >
              <span>Log out</span>
              <UserIcon className="mr-2 h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
