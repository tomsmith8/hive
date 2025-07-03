"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background flex">
      {isAuthenticated && (
        <Sidebar className="sticky top-0 left-0 h-screen z-40" />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="container mx-auto py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 