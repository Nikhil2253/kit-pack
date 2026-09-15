import { StateGraph, START, END } from "@langchain/langgraph";
import { extractRequirements } from "./nodes/extractRequirements.js";
import { researchCompany } from "./nodes/researchCompany.js";
import { generateCompanyBrief } from "./nodes/generateCompanyBrief.js";
import { generateRoleBreakdown } from "./nodes/generateRoleBreakdown.js";
import { researchInterviews } from "./nodes/researchInterviews.js";
import { generateQuestions } from "./nodes/generateQuestions.js";
import { checkCoverage } from "./nodes/checkCoverage.js";
import { fillGaps } from "./nodes/fillGaps.js";
import { generateFlashcards } from "./nodes/generateFlashcards.js";
import { buildSchedule } from "./nodes/buildSchedule.js";
import { assembleKit } from "./nodes/assembleKit.js";

const graph = new StateGraph({
  channels: {
    kitId: null,
    jobDescription: null,
    companyUrl: null,
    daysUntilInterview: null,
    requirements: null,
    companyResearch: null,
    roleBreakdown: null,
    interviewResearch: null,
    questions: null,
    coverage: null,
    missingRequirements: null,
    coverageAttempts: null,
    flashcards: null,
    schedule: null,
    kit: null,
    errors: null
  }
});

graph.addNode("extractRequirements", extractRequirements);
graph.addNode("researchCompany", researchCompany);
graph.addNode("generateCompanyBrief", generateCompanyBrief);
graph.addNode("generateRoleBreakdown", generateRoleBreakdown);
graph.addNode("researchInterviews", researchInterviews);
graph.addNode("generateQuestions", generateQuestions);
graph.addNode("checkCoverage", checkCoverage);
graph.addNode("fillGaps", fillGaps);
graph.addNode("generateFlashcards", generateFlashcards);
graph.addNode("buildSchedule", buildSchedule);
graph.addNode("assembleKit", assembleKit);

graph.addEdge(START, "extractRequirements");
graph.addEdge("extractRequirements", "researchCompany");
graph.addEdge("researchCompany", "generateCompanyBrief");
graph.addEdge("generateCompanyBrief", "generateRoleBreakdown");
graph.addEdge("generateRoleBreakdown", "researchInterviews");
graph.addEdge("researchInterviews", "generateQuestions");
graph.addEdge("generateQuestions", "checkCoverage");

graph.addConditionalEdges(
  "checkCoverage",
  (state) => {
    if (
      state.missingRequirements?.length &&
      (state.coverageAttempts || 0) < 3
    ) {
      return "fillGaps";
    }

    return "continue";
  },
  {
    fillGaps: "fillGaps",
    continue: "generateFlashcards"
  }
);

graph.addEdge("fillGaps", "checkCoverage");
graph.addEdge("generateFlashcards", "buildSchedule");
graph.addEdge("buildSchedule", "assembleKit");
graph.addEdge("assembleKit", END);

const interviewGraph = graph.compile();

export default interviewGraph;