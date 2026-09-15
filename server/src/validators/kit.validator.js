import { z } from "zod";

export const createKitSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(20, "Job description is too short")
    .max(30000, "Job description is too long"),

  companyUrl: z
    .string()
    .trim()
    .url("Invalid company URL"),

  daysUntilInterview: z
    .number()
    .int()
    .min(1)
    .max(60)
});

export const updateKitSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(20)
    .max(30000)
    .optional(),

  companyUrl: z
    .string()
    .trim()
    .url()
    .optional(),

  daysUntilInterview: z
    .number()
    .int()
    .min(1)
    .max(60)
    .optional()
});