import mongoose from "mongoose";

const kitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    jobDescription: {
      type: String,
      required: true,
      trim: true
    },

    companyUrl: {
      type: String,
      required: true,
      trim: true
    },

    daysUntilInterview: {
      type: Number,
      required: true,
      min: 1,
      max: 60
    },

    status: {
      type: String,
      enum: ["draft", "generating", "ready", "failed"],
      default: "draft"
    },

    generationStep: {
      type: String,
      enum: [
        "extracting_requirements",
        "researching_company",
        "generating_company_brief",
        "generating_role_breakdown",
        "researching_interviews",
        "generating_questions",
        "checking_coverage",
        "filling_gaps",
        "generating_flashcards",
        "building_schedule",
        "assembling_kit",
        "completed"
      ],
      default: null
    },

    companyBrief: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    roleBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    questions: {
  type: [
    {
      question: { type: String, default: "" },
      difficulty: { type: String, default: "medium" },
      category: { type: String, default: "technical" },
      requirementTags: { type: [String], default: [] }
    }
  ],
  default: []
},

flashcards: {
  type: [
    {
      question: { type: String, default: "" },
      answer: { type: String, default: "" },
      category: { type: String, default: "Technical" },
      difficulty: { type: String, default: "medium" },
      confidence: { type: Number, default: 0, min: 0, max: 5 }
    }
  ],
  default: []
},

    schedule: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },

    research: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    generationError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Kit = mongoose.model("Kit", kitSchema);

export default Kit;