"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { deleteKit, getKits } from "../../lib/kitApi";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const loadKits = async () => {
    try {
      setError("");
      const response = await getKits();
      setKits(response.kits || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your interview kits."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKits();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this interview preparation kit?"
    );

    if (!confirmed) return;

    setDeleting(id);

    try {
      await deleteKit(id);
      setKits((prev) => prev.filter((kit) => kit._id !== id));
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete this kit."
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const readyCount = kits.filter(
    (kit) => kit.status === "ready"
  ).length;

  const generatingCount = kits.filter(
    (kit) => kit.status === "generating"
  ).length;

  const totalQuestions = kits.reduce(
    (total, kit) => total + (kit.questions?.length || 0),
    0
  );

  return (
    <ProtectedRoute>
      <main className="min-h-full bg-slate-50">
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-slate-600">Dashboard</span>
            </div>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Your preparation workspace
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back
                  {user?.name
                    ? `, ${user.name.split(" ")[0]}`
                    : ""}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Prepare smarter with focused interview kits built
                  around your target role and company.
                </p>
              </div>

              <Link
                href="/kits/new"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Create New Kit
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                !
              </span>

              <p>{error}</p>
            </div>
          )}

          {!loading && kits.length > 0 && (
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total kits
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {kits.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Preparation projects
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ready
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {readyCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Kits ready to practice
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Generating
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {generatingCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently being prepared
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Questions
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {totalQuestions}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across all kits
                </p>
              </div>
            </section>
          )}

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Your Interview Kits
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Open a kit to continue your preparation.
              </p>
            </div>

            {kits.length > 0 && (
              <span className="text-xs font-medium text-slate-400">
                {kits.length} {kits.length === 1 ? "kit" : "kits"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="animate-pulse p-5">
                    <div className="flex justify-between gap-4">
                      <div className="space-y-2">
                        <div className="h-5 w-32 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-100" />
                      </div>

                      <div className="h-6 w-16 rounded-full bg-slate-100" />
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-xl bg-slate-100" />
                      <div className="h-16 rounded-xl bg-slate-100" />
                      <div className="h-16 rounded-xl bg-slate-100" />
                    </div>

                    <div className="mt-5 h-10 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : kits.length === 0 ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl font-bold text-white">
                  +
                </div>

                <h2 className="mt-6 text-xl font-bold text-slate-950">
                  Start your first preparation kit
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Add a job description, company website, and interview
                  timeline to build a focused preparation workspace.
                </p>

                <Link
                  href="/kits/new"
                  className="mt-6 inline-flex h-10 items-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create Your First Kit
                </Link>
              </div>
            </section>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {kits.map((kit) => (
                <article
                  key={kit._id}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-950">
                        {kit.companyBrief?.companyName ||
                          kit.companyUrl ||
                          "Interview Kit"}
                      </h2>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {kit.roleBreakdown?.role ||
                          "Role preparation"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        kit.status === "ready"
                          ? "bg-green-50 text-green-700"
                          : kit.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : kit.status === "generating"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {kit.status === "ready"
                        ? "Ready"
                        : kit.status === "failed"
                          ? "Failed"
                          : kit.status === "generating"
                            ? "Generating"
                            : kit.status}
                    </span>
                  </div>

                  <div className="mb-6 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <div className="text-lg font-bold text-slate-950">
                        {kit.questions?.length || 0}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        Questions
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <div className="text-lg font-bold text-slate-950">
                        {kit.flashcards?.length || 0}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        Flashcards
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <div className="text-lg font-bold text-slate-950">
                        {kit.daysUntilInterview || 0}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        Days
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/kits/${kit._id}`}
                      className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open Kit
                    </Link>

                    <button
                      onClick={() => handleDelete(kit._id)}
                      disabled={deleting === kit._id}
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting === kit._id ? "..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}