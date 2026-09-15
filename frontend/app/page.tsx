"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-bold text-slate-900 sm:text-xl"
          >
            Interview Prep Kit
          </Link>

          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-3xl">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            AI-powered interview preparation
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Prepare for the interview that actually matters.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Turn a job description and company website into a structured,
            research-backed interview preparation kit with questions,
            flashcards, and a personalized study schedule.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={user ? "/kits/new" : "/register"}
              className="rounded-lg bg-slate-900 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Build Your Prep Kit
            </Link>

            {!user && (
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "01",
              "Company research",
              "Understand the company, products, customers, and culture signals."
            ],
            [
              "02",
              "Role analysis",
              "Extract the skills, responsibilities, and technical focus from the JD."
            ],
            [
              "03",
              "Question bank",
              "Generate categorized questions and check coverage against requirements."
            ],
            [
              "04",
              "Study plan",
              "Turn your remaining days into a practical interview preparation schedule."
            ]
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <span className="text-sm font-bold text-blue-600">
                {number}
              </span>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}