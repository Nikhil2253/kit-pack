import Kit from "../models/Kit.js";

const updateGenerationStep = async (kitId, step) => {
  if (!kitId) return;

  await Kit.findByIdAndUpdate(kitId, {
    generationStep: step
  });
};

export default updateGenerationStep;