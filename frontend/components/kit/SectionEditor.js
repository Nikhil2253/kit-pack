"use client";

import { useEffect, useState } from "react";
import { updateSection } from "../../lib/builderApi";

const labels = {
  companyName: "Company Name",
  whatTheyDo: "What They Do",
  productsOrServices: "Products or Services",
  industry: "Industry",
  customers: "Customers",
  cultureSignals: "Culture Signals",
  keyFacts: "Key Facts",
  role: "Role",
  seniority: "Seniority",
  coreSkills: "Core Skills",
  technicalFocus: "Technical Focus",
  responsibilities: "Responsibilities",
  interviewFocus: "Interview Focus",
  niceToHave: "Nice to Have",
};

const formatLabel = (field) =>
  labels[field] ||
  field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

const companyFields = [
  "companyName",
  "whatTheyDo",
  "productsOrServices",
  "industry",
  "customers",
  "cultureSignals",
  "keyFacts",
];

const roleFields = [
  "role",
  "seniority",
  "coreSkills",
  "technicalFocus",
  "responsibilities",
  "interviewFocus",
  "niceToHave",
];

const getInitialData = (kit, section, fields) => {
  const source = kit[section] || {};

  return fields.reduce((acc, field) => {
    acc[field] = source[field] ?? "";
    return acc;
  }, {});
};

export default function SectionEditor({
  kit,
  section,
  title,
  fields,
  onUpdate,
}) {
  const [data, setData] = useState(
    getInitialData(kit, section, fields)
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setData(getInitialData(kit, section, fields));
  }, [kit, section, fields]);

  const handleChange = (field, value) => {
    setSaved(false);
    setError("");

    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setData(getInitialData(kit, section, fields));
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await updateSection(
        kit._id,
        section,
        data
      );

      onUpdate(response.kit);

      setEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderValue = (field) => {
    const value = data[field];

    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-sm text-slate-400">
          Not specified
        </span>
      );
    }

    if (!value) {
      return (
        <span className="text-sm text-slate-400">
          Not specified
        </span>
      );
    }

    return (
      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
        {value}
      </p>
    );
  };

  const renderEditor = (field) => {
    const value = data[field];
    const isArray = Array.isArray(value);

    return (
      <div
        key={field}
        className={
          isArray || field === "responsibilities" ||
          field === "interviewFocus" ||
          field === "whatTheyDo" ||
          field === "cultureSignals" ||
          field === "technicalFocus"
            ? "lg:col-span-2"
            : ""
        }
      >
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
          {formatLabel(field)}
        </label>

        {isArray ? (
          <textarea
            value={value.join("\n")}
            onChange={(e) =>
              handleChange(
                field,
                e.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)
              )
            }
            rows={5}
            placeholder={`Enter ${formatLabel(
              field
            ).toLowerCase()}, one item per line`}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) =>
              handleChange(field, e.target.value)
            }
            rows={
              field === "companyName" ||
              field === "role" ||
              field === "seniority"
                ? 2
                : 4
            }
            placeholder={`Enter ${formatLabel(
              field
            ).toLowerCase()}`}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />
        )}
      </div>
    );
  };

  const companySectionExists = fields.some((field) =>
    companyFields.includes(field)
  );

  const roleSectionExists = fields.some((field) =>
    roleFields.includes(field)
  );

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Interview Intelligence
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>

          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            Review the information powering your interview
            preparation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="m13.8 3.2 3 3m-1.8-4.2a2.1 2.1 0 0 1 3 3L7 16l-4 1 1-4L15 2Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Edit
            </button>
          )}
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

      {/* Editing Mode */}
      {editing ? (
        <div className="mt-7 space-y-7">
          {companySectionExists && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                  01
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Company Profile
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Understand the organization and its context.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {fields
                  .filter((field) =>
                    companyFields.includes(field)
                  )
                  .map(renderEditor)}
              </div>
            </div>
          )}

          {roleSectionExists && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                  02
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Role Profile
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Define what the interview is likely to focus
                    on.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {fields
                  .filter((field) =>
                    roleFields.includes(field)
                  )
                  .map(renderEditor)}
              </div>
            </div>
          )}

          {/* Other fields */}
          {fields.some(
            (field) =>
              !companyFields.includes(field) &&
              !roleFields.includes(field)
          ) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-2">
                {fields
                  .filter(
                    (field) =>
                      !companyFields.includes(field) &&
                      !roleFields.includes(field)
                  )
                  .map(renderEditor)}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Read-only Mode */
        <div className="mt-7 space-y-5">
          {companySectionExists && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">
                  01
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Company Profile
                  </h3>

                  <p className="text-[11px] text-slate-400">
                    Organization overview
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {fields
                  .filter((field) =>
                    companyFields.includes(field)
                  )
                  .map((field) => (
                    <div
                      key={field}
                      className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr]"
                    >
                      <div className="text-xs font-semibold text-slate-400">
                        {formatLabel(field)}
                      </div>

                      <div>{renderValue(field)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {roleSectionExists && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">
                  02
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Role Profile
                  </h3>

                  <p className="text-[11px] text-slate-400">
                    Position and interview expectations
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {fields
                  .filter((field) =>
                    roleFields.includes(field)
                  )
                  .map((field) => (
                    <div
                      key={field}
                      className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr]"
                    >
                      <div className="text-xs font-semibold text-slate-400">
                        {formatLabel(field)}
                      </div>

                      <div>{renderValue(field)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {fields.some(
            (field) =>
              !companyFields.includes(field) &&
              !roleFields.includes(field)
          ) && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="divide-y divide-slate-100">
                {fields
                  .filter(
                    (field) =>
                      !companyFields.includes(field) &&
                      !roleFields.includes(field)
                  )
                  .map((field) => (
                    <div
                      key={field}
                      className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr]"
                    >
                      <div className="text-xs font-semibold text-slate-400">
                        {formatLabel(field)}
                      </div>

                      <div>{renderValue(field)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {fields.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No information available
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Click Edit to add information to this section.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Saved */}
      {saved && (
        <div className="mt-5 flex items-center justify-end">
          <span className="flex items-center gap-2 text-xs font-semibold text-green-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px]">
              ✓
            </span>
            Changes saved
          </span>
        </div>
      )}
    </section>
  );
}