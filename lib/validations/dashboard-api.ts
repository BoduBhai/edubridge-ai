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
