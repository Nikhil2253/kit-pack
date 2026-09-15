import Kit from "../models/Kit.js";

export const getFlashcards = async (kitId, userId) => {
  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  return kit.flashcards || [];
};

export const updateConfidence = async (
  kitId,
  userId,
  flashcardId,
  confidence
) => {
  if (![0, 1, 2, 3, 4, 5].includes(Number(confidence))) {
    throw new Error("Confidence must be between 0 and 5");
  }

  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  const flashcard = kit.flashcards.find(
    (item) => String(item._id) === String(flashcardId)
  );

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  flashcard.confidence = Number(confidence);

  await kit.save();

  return flashcard;
};