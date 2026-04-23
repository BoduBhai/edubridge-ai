import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Date of birth must be a valid date.",
});

export const formSchema = z
  .object({
    country: z
      .string()
      .trim()
      .min(1, "Country of origin is required.")
      .max(80, "Country of origin must be at most 80 characters."),
    dateOfBirth: z.union([z.literal(""), isoDateSchema]),
    currentLevel: z
      .string()
      .trim()
      .min(1, "Current education level is required.")
      .max(40, "Current education level must be at most 40 characters."),
    targetLevel: z
      .string()
      .trim()
      .min(1, "Target degree level is required.")
      .max(40, "Target degree level must be at most 40 characters."),
    intendedMajor: z
      .string()
      .trim()
      .min(1, "Intended major is required.")
      .max(100, "Intended major must be at most 100 characters."),
    gpaScale: z.enum(["4", "10"]),
    gpa: z
      .string()
      .min(1, "GPA is required.")
      .refine((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0;
      }, "GPA must be a valid non-negative number."),
    annualIncomeRange: z
      .string()
      .trim()
      .min(1, "Annual family income is required.")
      .max(40, "Annual family income must be at most 40 characters."),
    financialAidNeed: z.enum([
      "full_funding_required",
      "partial_aid_ok",
      "no_aid_needed",
    ]),
    englishTest: z.union([
      z.literal(""),
      z.string().trim().max(30, "English test must be at most 30 characters."),
    ]),
    englishScore: z.union([
      z.literal(""),
      z.string().refine((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0;
      }, "English score must be a valid positive number."),
    ]),
    targetYear: z
      .string()
      .trim()
      .min(1, "Target enrollment year is required.")
      .max(10, "Target enrollment year must be at most 10 characters."),
    preferredStates: z.array(z.string()),
    extracurriculars: z.array(z.string()),
  })
  .superRefine((value, ctx) => {
    const gpa = Number(value.gpa);
    const scale = Number(value.gpaScale);

    if (Number.isFinite(gpa) && Number.isFinite(scale) && gpa > scale) {
      ctx.addIssue({
        code: "custom",
        path: ["gpa"],
        message: "GPA cannot be greater than the selected GPA scale.",
      });
    }

    if (value.englishTest !== "" && value.englishScore === "") {
      ctx.addIssue({
        code: "custom",
        path: ["englishScore"],
        message: "English score is required when a test is selected.",
      });
    }

    if (value.englishTest === "" && value.englishScore !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["englishTest"],
        message: "Please select an English test for the provided score.",
      });
    }

    const englishScore = Number(value.englishScore);
    if (
      value.englishTest === "Duolingo English Test" &&
      value.englishScore !== "" &&
      Number.isFinite(englishScore) &&
      (englishScore < 10 || englishScore > 160)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["englishScore"],
        message: "Duolingo score must be between 10 and 160.",
      });
    }
  });

export const upsertStudentProfileSchema = formSchema.transform((value) => ({
  country: value.country,
  dateOfBirth: value.dateOfBirth === "" ? null : value.dateOfBirth,
  currentLevel: value.currentLevel,
  targetLevel: value.targetLevel,
  intendedMajor: value.intendedMajor,
  gpa: Number(value.gpa),
  gpaScale: Number(value.gpaScale),
  annualIncomeRange: value.annualIncomeRange,
  englishTest: value.englishTest === "" ? null : value.englishTest,
  englishScore: value.englishScore === "" ? null : Number(value.englishScore),
  financialAidNeed: value.financialAidNeed,
  targetYear: value.targetYear,
  preferredStates: value.preferredStates,
  extracurriculars: value.extracurriculars,
}));

const requiredProfileFields = [
  "country",
  "currentLevel",
  "targetLevel",
  "intendedMajor",
  "gpaScale",
  "gpa",
  "annualIncomeRange",
  "financialAidNeed",
  "targetYear",
] as const;

function hasNonEmptyValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value != null;
}

export function calculateProfileCompletion(
  profile: ProfileCompletionFormValues | null | undefined,
): number {
  if (!profile) {
    return 0;
  }

  const completedRequiredFields = requiredProfileFields.reduce(
    (count, field) => count + (hasNonEmptyValue(profile[field]) ? 1 : 0),
    0,
  );

  return Math.round(
    (completedRequiredFields / requiredProfileFields.length) * 100,
  );
}

export type ProfileCompletionFormValues = z.input<typeof formSchema>;
export type StudentProfileUpsertPayload = z.output<
  typeof upsertStudentProfileSchema
>;
