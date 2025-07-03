"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname } from "next/navigation";

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  // Only show sidebar on non-home routes
  const showSidebar = isAuthenticated && pathname !== "/";
  return (
    <div className="min-h-screen bg-background flex">
      {showSidebar && (
        <Sidebar className="sticky top-0 left-0 h-screen z-40" />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="py-8 px-8 space-y-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
} 