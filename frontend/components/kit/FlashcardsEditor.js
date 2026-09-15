"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Layers,
  Gauge
} from "lucide-react";
import { updateSection } from "../../lib/builderApi";
import { regenerateSection } from "../../lib/generationApi";

/*
  Design tokens — premium dark-card identity.

  page          #FFFFFF   page background (chrome, editor form)
  ink           #101114   headings / primary text on light surfaces
  ink-soft      #6B7280   secondary text on light surfaces

  card-start    #1C1E24   flashcard surface gradient start
  card-end      #121317   flashcard surface gradient end
  card-text     #F5F5F7   primary text on the dark card
  card-text-soft #9CA0AC  secondary text on the dark card

  Difficulty is the single color system — it's the one axis of the
  content that's actually meaningful, so it's the one thing that gets
  color, everywhere (pill, dot, confidence meter):
    easy    #10B981  emerald
    medium  #F59E0B  amber
    hard    #F43F5E  rose
*/

const DIFFICULTY_META = {
  easy: { label: "Easy", color: "#10B981", tint: "#0F2A22" },
  medium: { label: "Medium", color: "#F59E0B", tint: "#2A2212" },
  hard: { label: "Hard", color: "#F43F5E", tint: "#2A1418" }
};

function getDifficultyMeta(difficulty) {
  return DIFFICULTY_META[difficulty] || DIFFICULTY_META.medium;
}

export default function FlashcardsEditor({ kit, onUpdate }) {
  const [flashcards, setFlashcards] = useState(kit.flashcards || []);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [isNewCard, setIsNewCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFlashcards(kit.flashcards || []);
    setCurrent(0);
    setFlipped(false);
  }, [kit.flashcards]);

  const card = flashcards[current];
  const accent = getDifficultyMeta(card?.difficulty);
  const ANIMATION_MS = 500;

  const changeCard = (index, moveDirection) => {
    if (
      animating ||
      index < 0 ||
      index >= flashcards.length ||
      index === current
    ) {
      return;
    }

    setDirection(moveDirection);
    setAnimating(true);
    setFlipped(false);

    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, ANIMATION_MS);
  };

  const nextCard = () => changeCard(current + 1, 1);
  const previousCard = () => changeCard(current - 1, -1);

  const openEditor = () => {
    setEditCard({
      ...card,
      requirementTags: card?.requirementTags || []
    });
    setIsNewCard(false);
    setEditing(true);
    setError("");
  };

  const closeEditor = () => {
    if (isNewCard) {
      setFlashcards((prev) => prev.filter((_, index) => index !== current));
      setCurrent((prev) => Math.max(0, prev - 1));
      setIsNewCard(false);
    }

    setEditing(false);
    setEditCard(null);
    setError("");
  };

  const handleEditChange = (field, value) => {
    setEditCard((prev) => ({ ...prev, [field]: value }));
  };

  const saveEditedCard = async () => {
    if (!editCard?.question?.trim()) {
      setError("Question cannot be empty.");
      return;
    }

    if (!editCard?.answer?.trim()) {
      setError("Answer cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = flashcards.map((item, index) =>
        index === current ? { ...editCard } : item
      );

      const response = await updateSection(kit._id, "flashcards", updated);

      setFlashcards(response.kit.flashcards || []);
      onUpdate(response.kit);
      setEditing(false);
      setEditCard(null);
      setIsNewCard(false);
      setSaved(true);

      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to save this flashcard."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const newCard = {
      question: "New interview question",
      answer: "Add the answer or explanation here.",
      category: "Technical",
      difficulty: "medium",
      confidence: 0,
      requirementTags: []
    };

    setFlashcards((prev) => [...prev, newCard]);
    setCurrent(flashcards.length);
    setFlipped(false);
    setEditing(true);
    setEditCard(newCard);
    setIsNewCard(true);
  };

  const handleDelete = async () => {
    if (!card || deleting) return;

    const confirmed = window.confirm(`Delete flashcard ${current + 1}?`);
    if (!confirmed) return;

    const updated = flashcards.filter((_, index) => index !== current);

    setDeleting(true);
    setError("");

    try {
      const response = await updateSection(kit._id, "flashcards", updated);

      setFlashcards(response.kit.flashcards || []);
      onUpdate(response.kit);

      if (current >= updated.length) {
        setCurrent(Math.max(0, updated.length - 1));
      }

      setFlipped(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to delete this flashcard."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError("");

    try {
      const response = await regenerateSection(kit._id, "flashcards");

      setFlashcards(response.kit.flashcards || []);
      setCurrent(0);
      setFlipped(false);
      onUpdate(response.kit);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to regenerate flashcards."
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleConfidence = async (confidence) => {
    const previous = flashcards;
    const updated = flashcards.map((item, index) =>
      index === current ? { ...item, confidence } : item
    );

    setFlashcards(updated);
    setError("");

    try {
      const response = await updateSection(kit._id, "flashcards", updated);

      setFlashcards(response.kit.flashcards || []);
      onUpdate(response.kit);
    } catch (error) {
      setFlashcards(previous);
      setError(
        error.response?.data?.message || "Unable to update confidence."
      );
    }
  };

  // ---------------------------------------------------------------- empty
  if (flashcards.length === 0) {
    return (
      <section className="bg-white p-6">
        <div className="mb-8 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#101114]">
              Flashcards
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Review important concepts before the interview.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-semibold text-[#101114] shadow-sm transition hover:bg-[#FAFAFA] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={regenerating ? "animate-spin" : ""}
            />
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
        </div>

        <div className="mx-auto max-w-lg rounded-3xl border-2 border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101114] text-white">
            <Layers size={26} strokeWidth={1.75} />
          </div>

          <h3 className="mt-5 text-lg font-extrabold text-[#101114]">
            Your deck is empty
          </h3>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#6B7280]">
            Generate a set of cards or add your first one.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#101114] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            <Plus size={16} />
            Add Flashcard
          </button>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------- editing
  if (editing) {
    return (
      <section className="bg-white p-6">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                {isNewCard ? "New card" : `Card ${current + 1}`}
              </p>
              <h3 className="mt-0.5 text-lg font-extrabold text-[#101114]">
                Edit flashcard
              </h3>
            </div>

            <button
              type="button"
              onClick={closeEditor}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F5F5F7] hover:text-[#101114]"
              aria-label="Cancel"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-5 rounded-2xl bg-[#FEF2F3] px-4 py-3 text-sm text-[#C0392B]">
              {error}
            </div>
          )}

          <div className="space-y-5 px-6 py-6">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#101114]">
                Question
              </label>
              <textarea
                value={editCard?.question || ""}
                onChange={(e) => handleEditChange("question", e.target.value)}
                rows={4}
                className="w-full resize-y rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 text-[15px] leading-6 text-[#101114] outline-none focus:border-[#101114]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#101114]">
                Answer
              </label>
              <textarea
                value={editCard?.answer || ""}
                onChange={(e) => handleEditChange("answer", e.target.value)}
                rows={7}
                className="w-full resize-y rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 text-[15px] leading-6 text-[#101114] outline-none focus:border-[#101114]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#101114]">
                  Category
                </label>
                <input
                  value={editCard?.category || ""}
                  onChange={(e) => handleEditChange("category", e.target.value)}
                  className="h-11 w-full rounded-2xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#101114] outline-none focus:border-[#101114]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#101114]">
                  Difficulty
                </label>
                <select
                  value={editCard?.difficulty || "medium"}
                  onChange={(e) => handleEditChange("difficulty", e.target.value)}
                  className="h-11 w-full rounded-2xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#101114] outline-none focus:border-[#101114]"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#101114]">
                <Gauge size={15} />
                Confidence
              </label>
              <ConfidenceMeter
                value={editCard?.confidence || 0}
                onChange={(level) => handleEditChange("confidence", level)}
                color={getDifficultyMeta(editCard?.difficulty).color}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E5E5E5] pt-5">
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-5 py-2.5 text-sm font-semibold text-[#101114] hover:bg-[#FAFAFA]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEditedCard}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#101114] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                <Check size={15} />
                {saving ? "Saving…" : "Save Card"}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------- deck
  return (
    <section className="bg-white p-6">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
        <div>
          <h2 className="text-xl font-extrabold text-[#101114]">
            Flashcards
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Test yourself, flip the card, and move through your deck.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-semibold text-[#101114] shadow-sm transition hover:bg-[#FAFAFA] disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={regenerating ? "animate-spin" : ""}
            />
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-full bg-[#101114] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-[#FEF2F3] px-4 py-3 text-sm font-medium text-[#8A1F44]">
          {error}
        </div>
      )}

      <style>{`
        .fc-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
        .fc-scroll::-webkit-scrollbar { width: 5px; }
        .fc-scroll::-webkit-scrollbar-track { background: transparent; }
        .fc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 9999px; }
        .fc-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.32); }
      `}</style>

      {/* card */}
      <div className="mx-auto max-w-xl [perspective:1400px]">
        <div
          className="relative cursor-pointer"
          onClick={() => !animating && setFlipped(!flipped)}
        >
          <div
            className={`relative min-h-[400px] transition-all duration-500 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            } ${
              animating
                ? direction > 0
                  ? "-translate-x-6 opacity-0"
                  : "translate-x-6 opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {/* front — question */}
            <div
              className="absolute inset-0 overflow-hidden rounded-3xl [backface-visibility:hidden]"
              style={{
                background: "linear-gradient(160deg, #1C1E24 0%, #121317 100%)",
                boxShadow: `0 20px 45px -20px rgba(0,0,0,0.45), inset 0 0 0 1px ${accent.color}33`
              }}
            >
              <div className="flex h-full flex-col justify-between p-8 sm:p-10">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: accent.tint, color: accent.color }}
                  >
                    <HelpCircle size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize tracking-tight text-[#F5F5F7]">
                      {card?.category || "Technical"}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: accent.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accent.color }}
                      />
                      {accent.label}
                    </span>
                  </div>
                </div>

                <div className="py-6">
                  <p className="mb-3 text-sm font-bold text-[#9CA0AC]">
                    Question
                  </p>
                  <h3 className="text-2xl font-extrabold leading-snug text-[#F5F5F7] sm:text-[26px]">
                    {card?.question}
                  </h3>
                </div>

                <p className="text-sm font-medium text-[#9CA0AC]">
                  Tap the card to see the answer
                </p>
              </div>
            </div>

            {/* back — answer */}
            <div
              className="absolute inset-0 overflow-hidden rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{
                background: "linear-gradient(160deg, #1C1E24 0%, #121317 100%)",
                boxShadow: `0 20px 45px -20px rgba(0,0,0,0.45), inset 0 0 0 1px ${accent.color}33`
              }}
            >
              <div className="flex h-full flex-col justify-between p-8 sm:p-10">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: accent.tint, color: accent.color }}
                  >
                    <CheckCircle2 size={20} strokeWidth={2} />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize tracking-tight text-[#F5F5F7]">
                    {card?.category || "Technical"}
                  </span>
                </div>

                <div className="fc-scroll max-h-64 overflow-y-auto py-6 pr-3">
                  <p className="mb-3 text-sm font-bold text-[#9CA0AC]">
                    Answer
                  </p>
                  <AnswerContent text={card?.answer} accentColor={accent.color} />
                </div>

                <p className="text-sm font-medium text-[#9CA0AC]">
                  Tap the card to see the question
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* nav */}
      <div className="mx-auto mt-6 flex max-w-xl items-center justify-between">
        <button
          type="button"
          onClick={previousCard}
          disabled={current === 0 || animating}
          className="flex h-11 items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#101114] shadow-sm transition hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1.5">
          {flashcards.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => changeCard(index, index > current ? 1 : -1)}
              aria-label={`Go to card ${index + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: index === current ? "24px" : "8px",
                backgroundColor: index === current ? "#101114" : "#E5E5E5"
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextCard}
          disabled={current === flashcards.length - 1 || animating}
          className="flex h-11 items-center gap-1.5 rounded-full bg-[#101114] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* confidence */}
      <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: accent.tint, color: accent.color }}
            >
              <Gauge size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#101114]">Confidence</p>
              <p className="text-xs text-[#6B7280]">
                Rate how well you know this card.
              </p>
            </div>
          </div>

          <ConfidenceMeter
            value={card?.confidence || 0}
            onChange={handleConfidence}
            color={accent.color}
          />
        </div>
      </div>

      {/* actions */}
      <div className="mx-auto mt-5 flex max-w-xl justify-center gap-2">
        <button
          type="button"
          onClick={openEditor}
          className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-5 py-2.5 text-sm font-semibold text-[#101114] shadow-sm transition hover:bg-[#FAFAFA]"
        >
          <Pencil size={14} />
          Edit Card
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-full border border-[#FBD5DA] bg-white px-5 py-2.5 text-sm font-semibold text-[#C0392B] transition hover:bg-[#FEF2F3] disabled:opacity-50"
        >
          <Trash2 size={14} />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {saved && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#2E8B57]">
          <Check size={15} />
          Changes saved
        </div>
      )}
    </section>
  );
}

function renderInline(text, accentColor) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part !== "");

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold" style={{ color: accentColor }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function AnswerContent({ text, accentColor }) {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3.5">
      {lines.map((line, i) => {
        const isListItem = line.startsWith("- ") || line.startsWith("* ");
        const content = isListItem ? line.slice(2) : line;

        if (isListItem) {
          return (
            <div key={i} className="flex gap-3">
              <span
                className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <p className="text-[15px] leading-6 text-[#C7CAD1]">
                {renderInline(content, accentColor)}
              </p>
            </div>
          );
        }

        return (
          <p key={i} className="text-[15px] leading-6 text-[#C7CAD1]">
            {renderInline(content, accentColor)}
          </p>
        );
      })}
    </div>
  );
}

function ConfidenceMeter({ value, onChange, color }) {
  const MAX = 5;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: MAX }).map((_, i) => {
          const level = i + 1;
          const filled = level <= value;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level === value ? 0 : level)}
              aria-label={`Set confidence to ${level}`}
              className="h-2.5 w-6 rounded-full transition-colors"
              style={{ backgroundColor: filled ? color : "#E5E5E5" }}
            />
          );
        })}
      </div>
      <span className="text-xs font-bold tabular-nums text-[#6B7280]">
        {value}/{MAX}
      </span>
    </div>
  );
}