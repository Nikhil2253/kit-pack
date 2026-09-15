import Kit from "../models/Kit.js";
import interviewGraph from "../ai/graph.js";

const updateStep = async (kitId, step) => {
  await Kit.findByIdAndUpdate(kitId, {
    generationStep: step
  });
};

export const generateKit = async (kitId, userId) => {
  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  kit.status = "generating";
  kit.generationStep = "extracting_requirements";
  kit.generationError = null;

  await kit.save();

  try {
    const result = await interviewGraph.invoke({
      kitId: kit._id.toString(),
      jobDescription: kit.jobDescription,
      companyUrl: kit.companyUrl,
      daysUntilInterview: kit.daysUntilInterview
    });

    const generatedKit = result.kit || {};

    await updateStep(kit._id, "assembling_kit");

    kit.companyBrief = generatedKit.companyBrief || {};
    kit.roleBreakdown = generatedKit.roleBreakdown || {};
    kit.questions = generatedKit.questions || [];
    kit.flashcards = generatedKit.flashcards || [];
    kit.schedule = generatedKit.schedule || [];

    kit.research = {
      company: result.companyResearch || null,
      interviews: result.interviewResearch || null,
      requirements: result.requirements || null,
      coverage: result.coverage || null
    };

    kit.status = "ready";
    kit.generationStep = "completed";
    kit.generationError = null;

    await kit.save();

    return kit;
  } catch (error) {
    kit.status = "failed";
    kit.generationStep = null;
    kit.generationError = error.message;

    await kit.save();

    throw error;
  }
};

const parseJson = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No valid JSON object found");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
};

const regenerateSection = async (kitId, userId, section) => {
  const kit = await Kit.findOne({
    _id: kitId,
    user: userId
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  let prompt = "";

  if (section === "companyBrief") {
    prompt = `
Regenerate only the company brief.

Company research:
${JSON.stringify(kit.research?.company || {})}

Return ONLY JSON:

{
  "companyName": "",
  "whatTheyDo": "",
  "productsOrServices": [],
  "industry": "",
  "customers": [],
  "cultureSignals": [],
  "keyFacts": []
}
`;
  }

  if (section === "roleBreakdown") {
    prompt = `
Regenerate only the role breakdown.

Requirements:
${JSON.stringify(kit.research?.requirements || {})}

Job Description:
${kit.jobDescription}

Return ONLY JSON:

{
  "role": "",
  "seniority": "",
  "coreSkills": [],
  "technicalFocus": [],
  "responsibilities": [],
  "interviewFocus": [],
  "niceToHave": []
}
`;
  }

  if (section === "questions") {
    prompt = `
Regenerate the interview question bank.

Requirements:
${JSON.stringify(kit.research?.requirements || {})}

Role:
${JSON.stringify(kit.roleBreakdown || {})}

Interview research:
${JSON.stringify(kit.research?.interviews || {})}

Return ONLY JSON:

{
  "technical": [],
  "coding": [],
  "behavioral": [],
  "systemDesign": [],
  "companySpecific": []
}

Each question must contain:

{
  "question": "",
  "difficulty": "",
  "category": "",
  "requirementTags": []
}
`;
  }

  if (section === "flashcards") {
    prompt = `
Regenerate interview preparation flashcards.

Questions:
${JSON.stringify(kit.questions || [])}

Return ONLY JSON:

{
  "flashcards": [
    {
      "question": "",
      "answer": "",
      "category": "",
      "difficulty": "",
      "confidence": 0
    }
  ]
}
`;
  }

  if (section === "schedule") {
    throw new Error(
      "Schedule regeneration is handled deterministically"
    );
  }

  const response = await model.invoke(prompt);

  const rawText =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const generated = parseJson(rawText);

  if (section === "companyBrief") {
    kit.companyBrief = generated;
  }

  if (section === "roleBreakdown") {
    kit.roleBreakdown = generated;
  }

  if (section === "questions") {
    const questions = [
      ...(generated.technical || []),
      ...(generated.coding || []),
      ...(generated.behavioral || []),
      ...(generated.systemDesign || []),
      ...(generated.companySpecific || [])
    ];

    kit.questions = questions;
  }

  if (section === "flashcards") {
    kit.flashcards = generated.flashcards || [];
  }

  await kit.save();

  return kit;
};

export {
  regenerateSection
};