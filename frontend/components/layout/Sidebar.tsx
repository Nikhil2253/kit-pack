"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "⌂"
  },
  {
    label: "My Prep Kits",
    href: "/dashboard",
    icon: "▣"
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-screen flex-col">

        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
              IP
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950">
                Interview Prep
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                AI Preparation Kit
              </p>
            </div>
          </Link>
        </div>

        <nav className="px-3 pt-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Navigation
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const active =
                item.label === "Overview"
                  ? pathname === "/dashboard"
                  : pathname.startsWith("/kits");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${
                      active
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-slate-200 p-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">
              Ready for your interview?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Build a focused preparation kit from your job description.
            </p>

            <Link
              href="/kits/new"
              className="mt-3 flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Create a kit
            </Link>
          </div>

          <div className="my-3 h-px bg-slate-200" />

          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-sm">
              ↪
            </span>

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}