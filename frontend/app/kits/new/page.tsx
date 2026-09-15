"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { createKit } from "../../../lib/kitApi";
import { startGeneration } from "../../../lib/generationApi";

export default function NewKitPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    jobDescription: "",
    companyUrl: "",
    daysUntilInterview: 7
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const jobDescription = form.jobDescription.trim();
    const companyUrl = form.companyUrl.trim();
    const days = Number(form.daysUntilInterview);

    if (jobDescription.length < 20) {
      setError("Job description must contain at least 20 characters.");
      return;
    }

    if (jobDescription.length > 30000) {
      setError("Job description cannot exceed 30,000 characters.");
      return;
    }

    if (!companyUrl) {
      setError("Company website URL is required.");
      return;
    }

    try {
      new URL(companyUrl);
    } catch {
      setError("Please enter a valid company website URL.");
      return;
    }

    if (!Number.isInteger(days) || days < 1 || days > 60) {
      setError("Interview timeline must be between 1 and 60 days.");
      return;
    }

    setLoading(true);

    try {
      const response = await createKit({
        jobDescription,
        companyUrl,
        daysUntilInterview: days
      });

      const kitId = response?.kit?._id || response?._id;

      if (!kitId) {
        throw new Error("Kit creation failed.");
      }

      await startGeneration(kitId);

      router.push(`/kits/${kitId}`);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create the interview preparation kit."
      );

      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-full bg-slate-50">
        <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">

          <div className="mb-8">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              New preparation kit
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Prepare smarter for your interview.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Add the job description, company website, and your available
              preparation time. We&apos;ll build a personalized interview
              preparation kit for you.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                  !
                </span>

                <p>{error}</p>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
                    1
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-950">
                      Interview details
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Tell us where you&apos;re interviewing and when.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-5 py-6 sm:px-7">

                <div>
                  <label
                    htmlFor="companyUrl"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    Company website
                  </label>

                  <input
                    id="companyUrl"
                    type="url"
                    value={form.companyUrl}
                    onChange={(event) =>
                      handleChange("companyUrl", event.target.value)
                    }
                    placeholder="https://company.com"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Use the company&apos;s public website so we can research it.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="daysUntilInterview"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    Days until interview
                  </label>

                  <div className="relative">
                    <input
                      id="daysUntilInterview"
                      type="number"
                      min="1"
                      max="60"
                      value={form.daysUntilInterview}
                      onChange={(event) =>
                        handleChange(
                          "daysUntilInterview",
                          event.target.value
                        )
                      }
                      required
                      disabled={loading}
                      className="h-11 w-full rounded-md border border-slate-200 bg-white px-4 pr-16 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      days
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Choose between 1 and 60 days.
                    </p>

                    <span className="text-xs font-medium text-slate-400">
                      {form.daysUntilInterview}/60
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-y border-slate-200 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
                    2
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-950">
                      Job description
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      The more context you provide, the better the preparation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 sm:px-7">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="jobDescription"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Complete job description
                  </label>

                  <span
                    className={`shrink-0 text-xs font-medium ${
                      form.jobDescription.length > 30000
                        ? "text-red-600"
                        : "text-slate-400"
                    }`}
                  >
                    {form.jobDescription.length.toLocaleString()} / 30,000
                  </span>
                </div>

                <textarea
                  id="jobDescription"
                  value={form.jobDescription}
                  onChange={(event) =>
                    handleChange("jobDescription", event.target.value)
                  }
                  placeholder="Paste the complete job description here..."
                  rows={14}
                  required
                  disabled={loading}
                  className="w-full resize-y rounded-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                />

                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      ✓
                    </span>
                    Responsibilities
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      ✓
                    </span>
                    Required skills
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      ✓
                    </span>
                    Qualifications
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Ready to build your kit?
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Research and generation will start automatically.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating kit...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Generate prep kit
                        <span>→</span>
                      </span>
                    )}
                  </button>

                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span>Company research</span>
              <span>•</span>
              <span>Interview questions</span>
              <span>•</span>
              <span>Study schedule</span>
              <span>•</span>
              <span>Flashcards</span>
            </div>

          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}