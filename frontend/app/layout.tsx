"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

function AppLayout({ children }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const authPages = ["/login", "/register"];

  const isAuthPage = authPages.includes(pathname);
  const isLandingPage = pathname === "/";

  if (isAuthPage || isLandingPage) {
    return children;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading...
        </div>
      </main>
    );
  }

  if (!user) {
    return children;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}