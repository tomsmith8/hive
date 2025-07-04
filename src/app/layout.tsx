import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hive Platform - AI Native Product Development",
  description: "AI-first product management assistant that helps PMs plan backlogs, structure roadmaps, and accelerate delivery through an integrated bounty system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <LayoutWithSidebar>{children}</LayoutWithSidebar>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
