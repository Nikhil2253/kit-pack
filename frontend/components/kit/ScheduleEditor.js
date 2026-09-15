"use client";

import { useEffect, useState } from "react";
import { updateSection } from "../../lib/builderApi";

export default function ScheduleEditor({ kit, onUpdate }) {
  const [schedule, setSchedule] = useState(kit.schedule || []);
  const [editingDay, setEditingDay] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSchedule(kit.schedule || []);
  }, [kit.schedule]);

  const handleChange = (index, field, value) => {
    setSaved(false);
    setError("");

    setSchedule((prev) =>
      prev.map((day, i) =>
        i === index
          ? { ...day, [field]: value }
          : day
      )
    );
  };

  const handleActivities = (index, value) => {
    setSaved(false);
    setError("");

    setSchedule((prev) =>
      prev.map((day, i) =>
        i === index
          ? {
              ...day,
              activities: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : day
      )
    );
  };

  const handleAdd = () => {
    const newDay = {
      day: schedule.length + 1,
      focus: "",
      activities: [],
    };

    setSchedule((prev) => [...prev, newDay]);
    setEditingDay(newDay.day);
    setExpandedDay(newDay.day);
    setSaved(false);
    setError("");
  };

  const handleDelete = (index) => {
    setSchedule((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((day, i) => ({
          ...day,
          day: i + 1,
        }))
    );

    setEditingDay(null);
    setExpandedDay(null);
    setSaved(false);
  };

  const moveDay = (index, direction) => {
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= schedule.length
    ) {
      return;
    }

    const updated = [...schedule];

    [updated[index], updated[newIndex]] = [
      updated[newIndex],
      updated[index],
    ];

    setSchedule(
      updated.map((day, i) => ({
        ...day,
        day: i + 1,
      }))
    );

    setSaved(false);
  };

  const handleSave = async () => {
    const invalidDay = schedule.findIndex(
      (day) => !day.focus?.trim()
    );

    if (invalidDay !== -1) {
      setError(`Day ${invalidDay + 1} focus cannot be empty.`);
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await updateSection(
        kit._id,
        "schedule",
        schedule
      );

      setSchedule(response.kit.schedule || []);
      onUpdate(response.kit);

      setEditingDay(null);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save the study schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setExpandedDay((prev) =>
      prev === day ? null : day
    );
  };

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Preparation Roadmap
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Study Schedule
          </h2>

          <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
            Structure your preparation journey into focused,
            actionable days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Duration
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {schedule.length}{" "}
              {schedule.length === 1 ? "Day" : "Days"}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
            !
          </span>
          {error}
        </div>
      )}

      {/* Empty */}
      {schedule.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-light text-slate-400 shadow-sm">
            +
          </div>

          <h3 className="mt-5 text-sm font-bold text-slate-900">
            Your roadmap is empty
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Start by creating your first preparation day.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create First Day
          </button>
        </div>
      ) : (
        /* Roadmap */
        <div className="relative mt-8">
          {/* Vertical line */}
          <div className="absolute bottom-8 left-[23px] top-8 w-px bg-slate-200" />

          <div className="space-y-4">
            {schedule.map((day, index) => {
              const isEditing = editingDay === day.day;
              const isExpanded = expandedDay === day.day;
              const activities = day.activities || [];

              return (
                <div
                  key={`${day.day}-${index}`}
                  className="relative pl-14"
                >
                  {/* Timeline node */}
                  <div
                    className={`absolute left-0 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white text-sm font-bold shadow-sm ${
                      isExpanded
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {day.day}
                  </div>

                  {/* Main item */}
                  <div
                    className={`overflow-hidden rounded-2xl border transition ${
                      isExpanded
                        ? "border-slate-300 bg-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {/* Summary */}
                    <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Day {day.day}
                          </span>

                          {index === 0 && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                              START
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <input
                            autoFocus
                            value={day.focus || ""}
                            placeholder="What should you focus on?"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "focus",
                                e.target.value
                              )
                            }
                            className="mt-1 h-10 w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                          />
                        ) : (
                          <h3 className="mt-1 truncate text-sm font-bold text-slate-900">
                            {day.focus || "Untitled focus"}
                          </h3>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Activity count */}
                        <div className="hidden rounded-lg bg-slate-50 px-3 py-2 sm:block">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Tasks
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {activities.length}
                          </p>
                        </div>

                        {/* Move */}
                        <button
                          type="button"
                          onClick={() =>
                            moveDay(index, -1)
                          }
                          disabled={index === 0}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-25"
                          aria-label="Move up"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveDay(index, 1)
                          }
                          disabled={
                            index === schedule.length - 1
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-25"
                          aria-label="Move down"
                        >
                          ↓
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingDay(null);
                            } else {
                              setEditingDay(day.day);
                              setExpandedDay(day.day);
                            }
                          }}
                          className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${
                            isEditing
                              ? "border-slate-300 bg-slate-100 text-slate-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>

                        {/* Expand */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleDay(day.day)
                          }
                          aria-label={
                            isExpanded
                              ? "Collapse day"
                              : "Expand day"
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                        >
                          <svg
                            className={`h-4 w-4 transition-transform ${
                              isExpanded
                                ? "rotate-180"
                                : ""
                            }`}
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              d="m5 7.5 5 5 5-5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(index)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:bg-red-50"
                          aria-label="Delete day"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path
                              d="M4 6h12M8 6V4h4v2m-6 0 .7 10h6.6L14 6M8.5 9v4m3-4v4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-5">
                        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                          {/* Focus */}
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Day Focus
                              </label>
                            </div>

                            {isEditing ? (
                              <input
                                value={day.focus || ""}
                                placeholder="What should you focus on?"
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "focus",
                                    e.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              />
                            ) : (
                              <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                <p className="text-sm font-semibold leading-6 text-slate-800">
                                  {day.focus ||
                                    "No focus defined"}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Activities */}
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Activities
                              </label>

                              <span className="text-[10px] font-semibold text-slate-400">
                                {activities.length} tasks
                              </span>
                            </div>

                            {isEditing ? (
                              <textarea
                                value={activities.join("\n")}
                                placeholder="Add one activity per line"
                                rows={5}
                                onChange={(e) =>
                                  handleActivities(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              />
                            ) : activities.length > 0 ? (
                              <div className="rounded-xl border border-slate-200 bg-white p-2">
                                {activities.map(
                                  (activity, activityIndex) => (
                                    <div
                                      key={activityIndex}
                                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                                    >
                                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[9px] text-slate-400">
                                        {activityIndex + 1}
                                      </span>

                                      <span className="text-sm leading-5 text-slate-700">
                                        {activity}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-400">
                                No activities planned
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                            <p className="text-xs text-slate-400">
                              Changes are saved to this schedule.
                            </p>

                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={saving}
                              className="inline-flex h-9 items-center rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {saving
                                ? "Saving..."
                                : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      {schedule.length > 0 && (
        <div className="mt-7 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="mr-2 text-base font-normal">
              +
            </span>
            Add Preparation Day
          </button>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-xs font-semibold text-green-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px]">
                  ✓
                </span>
                Schedule saved
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}