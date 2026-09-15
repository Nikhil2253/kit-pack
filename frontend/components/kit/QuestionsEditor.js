"use client";

import { useEffect, useState } from "react";
import {
  updateQuestion,
  deleteQuestion,
  updateSection
} from "../../lib/builderApi";

export default function QuestionsEditor({ kit, onUpdate }) {
  const [questions, setQuestions] = useState(kit.questions || []);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [savingQuestion, setSavingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedQuestion, setSavedQuestion] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuestions(kit.questions || []);
  }, [kit.questions]);

  const handleChange = (index, field, value) => {
    setError("");
    setSavedQuestion(null);

    setQuestions((prev) =>
      prev.map((question, i) =>
        i === index
          ? {
              ...question,
              [field]: value
            }
          : question
      )
    );
  };

  const handleEdit = (question) => {
    setEditingQuestion(question._id);
    setError("");
    setSavedQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setError("");
  };

  const handleSaveQuestion = async (question, index) => {
    if (!question.question?.trim()) {
      setError(`Question ${index + 1} cannot be empty.`);
      return;
    }

    if (!question._id) {
      await handleSaveAll();
      return;
    }

    setSavingQuestion(question._id);
    setError("");

    try {
      const response = await updateQuestion(
        kit._id,
        question._id,
        {
          question: question.question,
          difficulty: question.difficulty,
          category: question.category,
          requirementTags: question.requirementTags || []
        }
      );

      setQuestions(response.kit.questions || []);
      onUpdate(response.kit);
      setEditingQuestion(null);
      setSavedQuestion(question._id);

      setTimeout(() => {
        setSavedQuestion(null);
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to save question ${index + 1}.`
      );
    } finally {
      setSavingQuestion(null);
    }
  };

  const handleDelete = async (index) => {
    const question = questions[index];

    if (!question._id) {
      setQuestions((prev) =>
        prev.filter((_, i) => i !== index)
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete question ${index + 1}?`
    );

    if (!confirmed) return;

    setDeletingQuestion(question._id);
    setError("");

    try {
      const response = await deleteQuestion(
        kit._id,
        question._id
      );

      setQuestions(response.kit.questions || []);
      onUpdate(response.kit);

      if (expandedQuestion === question._id) {
        setExpandedQuestion(null);
      }

      if (editingQuestion === question._id) {
        setEditingQuestion(null);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete this question."
      );
    } finally {
      setDeletingQuestion(null);
    }
  };

  const handleAdd = () => {
    setError("");
    setSavedQuestion(null);

    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        difficulty: "medium",
        category: "technical",
        requirementTags: []
      }
    ]);
  };

  const moveQuestion = (index, direction) => {
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= questions.length
    ) {
      return;
    }

    const updated = [...questions];

    [updated[index], updated[newIndex]] = [
      updated[newIndex],
      updated[index]
    ];

    setQuestions(updated);
    setSavedQuestion(null);
  };

  const handleSaveAll = async () => {
    const emptyQuestion = questions.findIndex(
      (question) => !question.question?.trim()
    );

    if (emptyQuestion !== -1) {
      setError(
        `Question ${emptyQuestion + 1} cannot be empty.`
      );
      return;
    }

    setSaving(true);
    setError("");
    setSavedQuestion(null);

    try {
      const response = await updateSection(
        kit._id,
        "questions",
        questions
      );

      setQuestions(response.kit.questions || []);
      onUpdate(response.kit);
      setEditingQuestion(null);
      setSavedQuestion("all");

      setTimeout(() => {
        setSavedQuestion(null);
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save the questions."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleDetails = (id) => {
    setExpandedQuestion((prev) =>
      prev === id ? null : id
    );
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "border-green-200 bg-green-50 text-green-700";

      case "hard":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Question Bank
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage your interview questions and review their details.
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {questions.length}{" "}
          {questions.length === 1 ? "question" : "questions"}
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <h3 className="text-sm font-bold text-slate-900">
            No questions yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Add your first interview question to start building
            your question bank.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add Question
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-16 px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Question
                  </th>

                  <th className="w-36 px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Difficulty
                  </th>

                  <th className="w-40 px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="w-56 px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {questions.map((question, index) => {
                  const id =
                    question._id || `new-${index}`;

                  const isEditing =
                    editingQuestion === question._id;

                  const isExpanded =
                    expandedQuestion === id;

                  return (
                    <tr
                      key={id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td
                        colSpan={5}
                        className="p-0"
                      >
                        <div className="grid grid-cols-[64px_1fr_144px_160px_224px]">
                          <div className="px-5 py-5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
                              {index + 1}
                            </div>
                          </div>

                          <div className="px-5 py-5">
                            {isEditing ? (
                              <textarea
                                value={
                                  question.question || ""
                                }
                                rows={3}
                                autoFocus
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "question",
                                    e.target.value
                                  )
                                }
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                              />
                            ) : (
                              <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-800">
                                {question.question}
                              </p>
                            )}
                          </div>

                          <div className="px-5 py-5">
                            {isEditing ? (
                              <select
                                value={
                                  question.difficulty ||
                                  "medium"
                                }
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "difficulty",
                                    e.target.value
                                  )
                                }
                                className={`h-9 w-full rounded-lg border px-3 text-xs font-semibold capitalize outline-none focus:ring-2 focus:ring-slate-100 ${getDifficultyClass(
                                  question.difficulty
                                )}`}
                              >
                                <option value="easy">
                                  Easy
                                </option>

                                <option value="medium">
                                  Medium
                                </option>

                                <option value="hard">
                                  Hard
                                </option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize ${getDifficultyClass(
                                  question.difficulty
                                )}`}
                              >
                                {question.difficulty ||
                                  "medium"}
                              </span>
                            )}
                          </div>

                          <div className="px-5 py-5">
                            {isEditing ? (
                              <input
                                value={
                                  question.category || ""
                                }
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "category",
                                    e.target.value
                                  )
                                }
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              />
                            ) : (
                              <span className="text-sm font-medium capitalize text-slate-600">
                                {question.category ||
                                  "Technical"}
                              </span>
                            )}
                          </div>

                          <div className="px-5 py-5">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveQuestion(
                                      question,
                                      index
                                    )
                                  }
                                  disabled={
                                    savingQuestion ===
                                    question._id
                                  }
                                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                                >
                                  {savingQuestion ===
                                  question._id
                                    ? "Saving..."
                                    : "Save"}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    handleCancelEdit
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleDetails(id)
                                  }
                                  aria-label={
                                    isExpanded
                                      ? "Hide details"
                                      : "Show details"
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <svg
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                      isExpanded
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(question)
                                  }
                                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(index)
                                  }
                                  disabled={
                                    deletingQuestion ===
                                    question._id
                                  }
                                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  {deletingQuestion ===
                                  question._id
                                    ? "..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}

                            {savedQuestion ===
                              question._id && (
                              <p className="mt-2 text-xs font-semibold text-green-600">
                                ✓ Saved
                              </p>
                            )}
                          </div>
                        </div>

                        {isExpanded &&
                          !isEditing && (
                            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                              <div className="ml-16 grid gap-6 sm:grid-cols-2">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Requirement Tags
                                  </p>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {(
                                      question.requirementTags ||
                                      []
                                    ).length > 0 ? (
                                      question.requirementTags.map(
                                        (
                                          tag,
                                          tagIndex
                                        ) => (
                                          <span
                                            key={`${tag}-${tagIndex}`}
                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600"
                                          >
                                            {tag}
                                          </span>
                                        )
                                      )
                                    ) : (
                                      <span className="text-sm text-slate-400">
                                        No requirement tags
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Difficulty
                                  </p>

                                  <div className="mt-3">
                                    <span
                                      className={`inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize ${getDifficultyClass(
                                        question.difficulty
                                      )}`}
                                    >
                                      {question.difficulty ||
                                        "medium"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          + Add Question
        </button>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save All Questions"}
        </button>

        {savedQuestion === "all" && (
          <span className="text-sm font-semibold text-green-600">
            ✓ Changes saved
          </span>
        )}
      </div>
    </section>
  );
}