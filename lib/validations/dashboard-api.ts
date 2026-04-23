import { z } from "zod";

const dateOrIsoStringSchema = z.union([z.date(), z.string()]).nullable();

export const ScholarshipRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  amountUsd: z.number(),
  renewable: z.boolean().nullable(),
  gpaMin: z.number(),
  eligibleCountries: z.array(z.string()),
  degreeLevels: z.array(z.string()),
  incomeRequirement: z.string(),
  eligibleMajors: z.array(z.string()),
  deadline: dateOrIsoStringSchema,
  awardType: z.string(),
  applicationUrl: z.string().nullable(),
  universityId: z.string().nullable(),
  descriptionText: z.string(),
  createdAt: dateOrIsoStringSchema,
  updatedAt: dateOrIsoStringSchema,
});

export const ScholarshipsApiResponseSchema = z.object({
  scholarships: z.array(ScholarshipRecordSchema),
});

export type ScholarshipRecord = z.infer<typeof ScholarshipRecordSchema>;
export type ScholarshipsApiResponse = z.infer<
  typeof ScholarshipsApiResponseSchema
>;

export const UniversityRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  acceptanceRate: z.number(),
  minGpa: z.number(),
  tuitionUsd: z.number(),
  financialAidAvail: z.boolean(),
  toeflMin: z.number().nullable(),
  ieltsMin: z.number().nullable(),
  supportedMajors: z.array(z.string()),
  applicationDeadline: dateOrIsoStringSchema,
  rankTier: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  descriptionText: z.string(),
  createdAt: dateOrIsoStringSchema,
  updatedAt: dateOrIsoStringSchema,
});

export const UniversitiesApiResponseSchema = z.object({
  universities: z.array(UniversityRecordSchema),
});

export type UniversityRecord = z.infer<typeof UniversityRecordSchema>;
export type UniversitiesApiResponse = z.infer<
  typeof UniversitiesApiResponseSchema
>;

export const DashboardMatchResultsStatusResponseSchema = z.object({
  hasMatchResults: z.boolean(),
  matchResults: z.lazy(() => DashboardGeminiMatchOutputSchema).nullish(),
});

export type DashboardMatchResultsStatusResponse = z.infer<
  typeof DashboardMatchResultsStatusResponseSchema
>;

export const DashboardMatchExplanationSchema = z.object({
  id: z.string().min(1),
  explanation: z.string().min(1),
});

export const DashboardMatchRoadmapItemSchema = z.object({
  month: z.number().int().min(1).max(12),
  task: z.string().min(1),
});

export const DashboardGeminiMatchOutputSchema = z.object({
  profileAssessment: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  improvements: z.array(z.string().min(1)).min(1),
  universityExplanations: z.array(DashboardMatchExplanationSchema),
  scholarshipExplanations: z.array(DashboardMatchExplanationSchema),
  roadmap: z.array(DashboardMatchRoadmapItemSchema).min(1),
});

export type DashboardGeminiMatchOutput = z.infer<
  typeof DashboardGeminiMatchOutputSchema
>;

export const DashboardChatRoleSchema = z.enum(["user", "assistant"]);

export const DashboardChatMessageSchema = z.object({
  id: z.string(),
  role: DashboardChatRoleSchema,
  content: z.string().min(1),
  createdAt: dateOrIsoStringSchema,
});

export const DashboardChatMessagesApiResponseSchema = z.object({
  messages: z.array(DashboardChatMessageSchema),
});

export const DashboardChatRequestSchema = z.object({
  message: z.string().min(1),
});

export const DashboardChatSendResponseSchema = z.object({
  userMessage: DashboardChatMessageSchema,
  assistantMessage: DashboardChatMessageSchema,
});

export type DashboardChatMessage = z.infer<typeof DashboardChatMessageSchema>;
