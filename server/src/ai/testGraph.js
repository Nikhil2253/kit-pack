import dotenv from "dotenv";

dotenv.config();

const { default: interviewGraph } = await import("./graph.js");

const result = await interviewGraph.invoke({
  jobDescription: `
Software Engineer

Requirements:
- Strong JavaScript and TypeScript
- Experience with React and Next.js
- Node.js and Express
- MongoDB
- REST APIs
- JWT authentication
- Docker
- AWS is a plus
`,
  companyUrl: "https://www.microsoft.com",
  daysUntilInterview: 10
});

console.log(JSON.stringify(result.interviewResearch, null, 2));