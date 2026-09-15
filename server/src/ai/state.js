export const createInitialState = (data = {}) => ({
  kitId: data.kitId || null,
  jobDescription: data.jobDescription || "",
  companyUrl: data.companyUrl || "",
  daysUntilInterview: data.daysUntilInterview || 1,
  requirements: null,
  companyResearch: null,
  interviewResearch: null,
  questions: [],
  coverage: null,
  missingRequirements: [],
  flashcards: [],
  schedule: [],
  errors: []
});