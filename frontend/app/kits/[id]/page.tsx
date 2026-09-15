"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { getKit, getGenerationStatus } from "../../../lib/kitApi";
import SectionEditor from "../../../components/kit/SectionEditor";
import QuestionsEditor from "../../../components/kit/QuestionsEditor";
import FlashcardsEditor from "../../../components/kit/FlashcardsEditor";
import ScheduleEditor from "../../../components/kit/ScheduleEditor";
import { regenerateSection } from "../../../lib/generationApi";

const steps = [
  ["extracting_requirements", "Extracting requirements"],
  ["researching_company", "Researching company"],
  ["generating_company_brief", "Generating company brief"],
  ["generating_role_breakdown", "Generating role breakdown"],
  ["researching_interviews", "Researching interviews"],
  ["generating_questions", "Generating questions"],
  ["checking_coverage", "Checking coverage"],
  ["filling_gaps", "Filling requirement gaps"],
  ["generating_flashcards", "Generating flashcards"],
  ["building_schedule", "Building study schedule"],
  ["assembling_kit", "Assembling kit"],
  ["completed", "Completed"],
];

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: "▦",
  },
  {
    id: "questions",
    label: "Questions",
    icon: "◉",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: "▣",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: "◷",
  },
];

export default function KitPage() {
  const { id } = useParams();

  const [kit, setKit] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regenerating, setRegenerating] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let interval;

    const load = async () => {
      try {
        setError("");

        const [kitResponse, statusResponse] = await Promise.all([
          getKit(id),
          getGenerationStatus(id),
        ]);

        setKit(kitResponse.kit);
        setStatus(statusResponse);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load this interview preparation kit."
        );
      } finally {
        setLoading(false);
      }
    };

    load();

    interval = setInterval(async () => {
      try {
        const response = await getGenerationStatus(id);

        setStatus(response);

        if (
          response.status === "ready" ||
          response.status === "failed"
        ) {
          const kitResponse = await getKit(id);
          setKit(kitResponse.kit);
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id]);

  const handleKitUpdate = (updatedKit) => {
    setKit(updatedKit);
  };

  const handleRegenerate = async (section) => {
    setRegenerating(section);
    setError("");

    try {
      const response = await regenerateSection(id, section);
      setKit(response.kit);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to regenerate ${section}.`
      );
    } finally {
      setRegenerating("");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-full bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-5 h-9 w-72 rounded bg-slate-200" />
              <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-28 rounded-2xl border border-slate-200 bg-white"
                  />
                ))}
              </div>

              <div className="mt-8 h-80 rounded-2xl border border-slate-200 bg-white" />
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                !
              </span>

              <p>{error}</p>
            </div>
          )}

          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
              <Link
                href="/dashboard"
                className="transition hover:text-slate-900"
              >
                Dashboard
              </Link>

              <span>/</span>

              <span className="text-slate-600">
                Interview Prep Kit
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Interview preparation
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Interview Prep Kit
                </h1>

                {kit?.companyBrief?.companyName && (
                  <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    {kit.companyBrief.companyName}
                    {kit.roleBreakdown?.role
                      ? ` · ${kit.roleBreakdown.role}`
                      : ""}
                  </p>
                )}
              </div>

              {status?.status === "ready" && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Ready
                </div>
              )}
            </div>
          </div>

          {status?.status === "generating" && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Generating your kit
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Researching the role and building your personalized
                      preparation plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 sm:px-7">
                <div className="space-y-2">
                  {steps.map(([key, label], index) => {
                    const active =
                      status.generationStep === key;

                    const currentIndex = steps.findIndex(
                      ([step]) => step === status.generationStep
                    );

                    const completed = currentIndex > index;

                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                          active
                            ? "bg-slate-950 text-white"
                            : completed
                              ? "bg-green-50 text-green-700"
                              : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            active
                              ? "bg-white/10 text-white"
                              : completed
                                ? "bg-green-100 text-green-700"
                                : "border border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {completed ? "✓" : index + 1}
                        </span>

                        <span className="text-sm font-medium">
                          {label}
                        </span>

                        {active && (
                          <span className="ml-auto text-xs font-medium text-white/60">
                            In progress
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {status?.status === "failed" && (
            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
                !
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Generation failed
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {status.generationError ||
                  "Something went wrong while generating your kit."}
              </p>

              <Link
                href="/kits/new"
                className="mt-6 inline-flex h-10 items-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create new kit
              </Link>
            </section>
          )}

          {status?.status === "ready" && kit && (
            <>
              {/* STATS */}
              <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Company
                  </p>

                  <h2 className="mt-2 truncate text-sm font-bold text-slate-950">
                    {kit.companyBrief?.companyName || "Not available"}
                  </h2>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Role
                  </p>

                  <h2 className="mt-2 truncate text-sm font-bold text-slate-950">
                    {kit.roleBreakdown?.role || "Not available"}
                  </h2>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Questions
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {kit.questions?.length || 0}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Interview questions
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Preparation time
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {kit.daysUntilInterview || 0}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Days remaining
                  </p>
                </div>
              </section>

              {/* TABS */}
              <nav className="mb-6 flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span className="text-base">
                        {tab.icon}
                      </span>

                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">

                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          Company Brief
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Research-backed information about the company.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleRegenerate("companyBrief")
                        }
                        disabled={
                          regenerating === "companyBrief"
                        }
                        className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {regenerating === "companyBrief"
                          ? "Regenerating..."
                          : "Regenerate"}
                      </button>
                    </div>

                    <div className="p-5 sm:p-7">
                      <SectionEditor
                        kit={kit}
                        section="companyBrief"
                        title=""
                        fields={[
                          "companyName",
                          "whatTheyDo",
                          "productsOrServices",
                          "industry",
                          "customers",
                          "cultureSignals",
                          "keyFacts",
                        ]}
                        onUpdate={handleKitUpdate}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          Role Breakdown
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Skills, responsibilities, and interview focus.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleRegenerate("roleBreakdown")
                        }
                        disabled={
                          regenerating === "roleBreakdown"
                        }
                        className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {regenerating === "roleBreakdown"
                          ? "Regenerating..."
                          : "Regenerate"}
                      </button>
                    </div>

                    <div className="p-5 sm:p-7">
                      <SectionEditor
                        kit={kit}
                        section="roleBreakdown"
                        title=""
                        fields={[
                          "role",
                          "seniority",
                          "coreSkills",
                          "technicalFocus",
                          "responsibilities",
                          "interviewFocus",
                          "niceToHave",
                        ]}
                        onUpdate={handleKitUpdate}
                      />
                    </div>
                  </section>

                </div>
              )}

              {/* QUESTIONS */}
              {activeTab === "questions" && (
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        Question Bank
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Edit, reorder, add, or remove interview questions.
                      </p>
                    </div>

                    <button
                      onClick={() => handleRegenerate("questions")}
                      disabled={regenerating === "questions"}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {regenerating === "questions"
                        ? "Regenerating..."
                        : "Regenerate"}
                    </button>
                  </div>

                  <div className="p-5 sm:p-7">
                    <QuestionsEditor
                      kit={kit}
                      onUpdate={handleKitUpdate}
                    />
                  </div>
                </section>
              )}

              {/* FLASHCARDS */}
              {activeTab === "flashcards" && (
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-slate-950">
                      Flashcards
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Review important concepts before your interview.
                    </p>
                  </div>

                  <div className="p-5 sm:p-7">
                    <FlashcardsEditor
                      kit={kit}
                      onUpdate={handleKitUpdate}
                    />
                  </div>
                </section>
              )}

              {/* SCHEDULE */}
              {activeTab === "schedule" && (
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-slate-950">
                      Study Schedule
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Follow your personalized preparation plan.
                    </p>
                  </div>

                  <div className="p-5 sm:p-7">
                    <ScheduleEditor
                      kit={kit}
                      onUpdate={handleKitUpdate}
                    />
                  </div>
                </section>
              )}

            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}