"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-end px-4 sm:px-6 lg:px-8">
        {!loading && (
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/kits/new"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  New Kit
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}