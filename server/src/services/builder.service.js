import Kit from "../models/Kit.js";

export const updateSection = async (
  kitId,
  userId,
  section,
  data
) => {
  const allowedSections = [
    "companyBrief",
    "roleBreakdown",
    "questions",
    "flashcards",
    "schedule"
  ];

  if (!allowedSections.includes(section)) {
    throw new Error("Invalid section");
  }

  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  kit[section] = data;

  await kit.save();

  return kit;
};

export const updateQuestion = async (
  kitId,
  userId,
  questionId,
  data
) => {
  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  const question = kit.questions.find(
    (item) => String(item._id) === String(questionId)
  );

  if (!question) {
    throw new Error("Question not found");
  }

  Object.assign(question, data);

  await kit.save();

  return kit;
};

export const deleteQuestion = async (
  kitId,
  userId,
  questionId
) => {
  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  kit.questions = kit.questions.filter(
    (item) => String(item._id) !== String(questionId)
  );

  await kit.save();

  return kit;
};