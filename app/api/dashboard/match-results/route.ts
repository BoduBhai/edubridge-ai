import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  matchResults,
  scholarships,
  studentProfiles,
  universities,
  users,
} from "@/db/schema";
import { DashboardGeminiMatchOutputSchema } from "@/lib/validations/dashboard-api";

const MATCH_STATUS_ERROR_MESSAGE = "Unable to load match results status.";
const MATCH_GENERATION_ERROR_MESSAGE = "Unable to generate AI match results.";
const MISSING_GEMINI_KEY_ERROR_MESSAGE =
  "Gemini API key is missing. Set GEMINI_API_KEY in environment variables.";

const PRIMARY_GEMINI_MODEL = "gemini-2.5-flash";
const FALLBACK_GEMINI_MODEL = "gemini-2.0-flash";

const MAX_UNIVERSITY_CANDIDATES = 15;
const MAX_SCHOLARSHIP_CANDIDATES = 10;

const GLOBAL_COUNTRY_ELIGIBILITY = new Set([
  "any",
  "worldwide",
  "all",
  "all countries",
  "global",
  "international",
]);

type UserProfileRecord = {
  country: string;
  targetLevel: string;
  intendedMajor: string;
  gpa: number;
  gpaScale: number;
  annualIncomeRange: string;
  englishTest: string | null;
  englishScore: number | null;
  financialAidNeed: string;
  preferredStates: string[] | null;
  targetYear: string;
};

type UniversityRecord = {
  id: string;
  name: string;
  state: string;
  acceptanceRate: number;
  minGpa: number;
  tuitionUsd: number;
  financialAidAvail: boolean;
  toeflMin: number | null;
  ieltsMin: number | null;
  supportedMajors: string[];
  applicationDeadline: string | Date | null;
  rankTier: string | null;
};

type ScholarshipRecord = {
  id: string;
  name: string;
  amountUsd: number;
  renewable: boolean | null;
  gpaMin: number;
  eligibleCountries: string[];
  degreeLevels: string[];
  incomeRequirement: string;
  eligibleMajors: string[];
  deadline: string | Date | null;
  awardType: string;
};

type RankedUniversity = UniversityRecord & { matchScore: number };
type RankedScholarship = ScholarshipRecord & { matchScore: number };

function normalizeValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toIsoDateString(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (directMatch) {
      return directMatch[1];
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate.toISOString().slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

function normalizeGpaToFourScale(gpa: number, gpaScale: number): number {
  if (gpaScale > 4) {
    return (gpa / gpaScale) * 4;
  }

  return gpa;
}

function canonicalDegreeLevel(value: string): string {
  const normalized = normalizeValue(value);

  if (normalized.includes("bachelor")) return "bachelor";
  if (normalized.includes("master")) return "master";
  if (normalized.includes("phd") || normalized.includes("doctor")) {
    return "phd";
  }

  return normalized;
}

function isMajorMatch(options: string[], intendedMajor: string): boolean {
  const normalizedMajor = normalizeValue(intendedMajor);

  return options.some((major) => {
    const normalized = normalizeValue(major);

    if (
      normalized === "all majors" ||
      normalized === "all" ||
      normalized === "stem"
    ) {
      return true;
    }

    return (
      normalized.includes(normalizedMajor) ||
      normalizedMajor.includes(normalized)
    );
  });
}

function isCountryEligible(
  eligibleCountries: string[],
  studentCountry: string,
): boolean {
  const normalizedCountry = normalizeValue(studentCountry);

  return eligibleCountries.some((country) => {
    const normalized = normalizeValue(country);

    return (
      normalized === normalizedCountry ||
      normalized.includes(normalizedCountry) ||
      GLOBAL_COUNTRY_ELIGIBILITY.has(normalized)
    );
  });
}

function isDegreeEligible(
  scholarshipLevels: string[],
  studentTargetLevel: string,
): boolean {
  const targetLevel = canonicalDegreeLevel(studentTargetLevel);

  return scholarshipLevels.some(
    (level) => canonicalDegreeLevel(level) === targetLevel,
  );
}

function resolveIncomeBand(annualIncomeRange: string): number {
  const normalized = normalizeValue(annualIncomeRange);

  if (normalized.includes("under") || normalized.includes("10 000")) return 1;
  if (normalized.includes("10 000") && normalized.includes("30 000")) {
    return 2;
  }
  if (normalized.includes("30 000") && normalized.includes("60 000")) {
    return 3;
  }
  if (normalized.includes("60 000") && normalized.includes("100 000")) {
    return 4;
  }
  if (normalized.includes("above") || normalized.includes("100 000")) {
    return 5;
  }

  return 3;
}

function scoreIncomeFit(incomeRequirement: string, annualIncomeRange: string) {
  const normalizedRequirement = normalizeValue(incomeRequirement);
  const incomeBand = resolveIncomeBand(annualIncomeRange);

  if (normalizedRequirement === "any") {
    return 8;
  }

  if (normalizedRequirement.includes("low")) {
    return incomeBand <= 2 ? 12 : 2;
  }

  return 6;
}

function scoreUniversity(
  profile: UserProfileRecord,
  university: UniversityRecord,
) {
  const normalizedGpa = normalizeGpaToFourScale(profile.gpa, profile.gpaScale);
  const gpaDelta = normalizedGpa - university.minGpa;

  const gpaScore =
    gpaDelta >= 0
      ? Math.min(30, 18 + gpaDelta * 10)
      : Math.max(0, 18 + gpaDelta * 20);

  const majorScore = isMajorMatch(
    university.supportedMajors,
    profile.intendedMajor,
  )
    ? 18
    : 0;

  const aidScore =
    profile.financialAidNeed === "full_funding_required"
      ? university.financialAidAvail
        ? 16
        : 0
      : profile.financialAidNeed === "partial_aid_ok"
        ? university.financialAidAvail
          ? 10
          : 6
        : 8;

  const preferredStates = profile.preferredStates ?? [];
  const locationScore = preferredStates.includes(university.state) ? 8 : 0;

  const englishScore = (() => {
    const englishTest = normalizeValue(profile.englishTest ?? "");
    const score = profile.englishScore;

    if (!englishTest || typeof score !== "number") {
      return 5;
    }

    if (englishTest.includes("toefl")) {
      if (typeof university.toeflMin !== "number") return 8;
      return score >= university.toeflMin ? 12 : 0;
    }

    if (englishTest.includes("ielts")) {
      if (typeof university.ieltsMin !== "number") return 8;
      return score >= university.ieltsMin ? 12 : 0;
    }

    return 6;
  })();

  const tuitionScore = Math.max(0, 12 - university.tuitionUsd / 10000);
  const selectivityScore = Math.max(0, 10 - university.acceptanceRate / 12);

  return Number(
    (
      gpaScore +
      majorScore +
      aidScore +
      locationScore +
      englishScore +
      tuitionScore +
      selectivityScore
    ).toFixed(2),
  );
}

function scoreScholarship(
  profile: UserProfileRecord,
  scholarship: ScholarshipRecord,
) {
  const normalizedGpa = normalizeGpaToFourScale(profile.gpa, profile.gpaScale);
  const gpaDelta = normalizedGpa - scholarship.gpaMin;

  const gpaScore =
    gpaDelta >= 0
      ? Math.min(30, 18 + gpaDelta * 10)
      : Math.max(0, 18 + gpaDelta * 20);

  const countryScore = isCountryEligible(
    scholarship.eligibleCountries,
    profile.country,
  )
    ? 22
    : 0;

  const degreeScore = isDegreeEligible(
    scholarship.degreeLevels,
    profile.targetLevel,
  )
    ? 16
    : 0;

  const majorScore = isMajorMatch(
    scholarship.eligibleMajors,
    profile.intendedMajor,
  )
    ? 16
    : 0;

  const incomeScore = scoreIncomeFit(
    scholarship.incomeRequirement,
    profile.annualIncomeRange,
  );

  const amountScore = Math.min(12, scholarship.amountUsd / 5000);
  const renewableScore = scholarship.renewable ? 4 : 0;

  return Number(
    (
      gpaScore +
      countryScore +
      degreeScore +
      majorScore +
      incomeScore +
      amountScore +
      renewableScore
    ).toFixed(2),
  );
}

function buildMatchPrompt(
  profile: UserProfileRecord,
  rankedUniversities: RankedUniversity[],
  rankedScholarships: RankedScholarship[],
) {
  return JSON.stringify(
    {
      studentProfile: {
        country: profile.country,
        targetLevel: profile.targetLevel,
        intendedMajor: profile.intendedMajor,
        gpa: profile.gpa,
        gpaScale: profile.gpaScale,
        annualIncomeRange: profile.annualIncomeRange,
        financialAidNeed: profile.financialAidNeed,
        englishTest: profile.englishTest,
        englishScore: profile.englishScore,
        preferredStates: profile.preferredStates ?? [],
        targetYear: profile.targetYear,
      },
      rankedUniversities: rankedUniversities.map((university) => ({
        id: university.id,
        name: university.name,
        state: university.state,
        acceptanceRate: university.acceptanceRate,
        minGpa: university.minGpa,
        tuitionUsd: university.tuitionUsd,
        financialAidAvail: university.financialAidAvail,
        rankTier: university.rankTier,
        applicationDeadline: toIsoDateString(university.applicationDeadline),
        supportedMajors: university.supportedMajors,
        matchScore: university.matchScore,
      })),
      rankedScholarships: rankedScholarships.map((scholarship) => ({
        id: scholarship.id,
        name: scholarship.name,
        amountUsd: scholarship.amountUsd,
        renewable: scholarship.renewable,
        gpaMin: scholarship.gpaMin,
        awardType: scholarship.awardType,
        deadline: toIsoDateString(scholarship.deadline),
        eligibleCountries: scholarship.eligibleCountries,
        degreeLevels: scholarship.degreeLevels,
        incomeRequirement: scholarship.incomeRequirement,
        eligibleMajors: scholarship.eligibleMajors,
        matchScore: scholarship.matchScore,
      })),
    },
    null,
    2,
  );
}

async function generateGeminiMatchOutput(
  profile: UserProfileRecord,
  rankedUniversities: RankedUniversity[],
  rankedScholarships: RankedScholarship[],
) {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(MISSING_GEMINI_KEY_ERROR_MESSAGE);
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const systemPrompt =
    "You are EduBridge AI, a concise admissions advisor. Use only the provided candidate IDs. Keep each explanation to 1-3 sentences, focused on fit, affordability, and practical actionability. Roadmap months must be integers 1-12 with clear, student-specific tasks.";

  const prompt = buildMatchPrompt(
    profile,
    rankedUniversities,
    rankedScholarships,
  );

  try {
    const { object } = await generateObject({
      model: google(PRIMARY_GEMINI_MODEL),
      schema: DashboardGeminiMatchOutputSchema,
      system: systemPrompt,
      prompt,
    });

    return object;
  } catch {
    const { object } = await generateObject({
      model: google(FALLBACK_GEMINI_MODEL),
      schema: DashboardGeminiMatchOutputSchema,
      system: systemPrompt,
      prompt,
    });

    return object;
  }
}

async function getUserIdForClerkUser(clerkUserId: string) {
  const [userRecord] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return userRecord?.id ?? null;
}

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdForClerkUser(clerkUserId);

  if (!userId) {
    return Response.json({ hasMatchResults: false });
  }

  const [latestMatchResult] = await db
    .select({ geminiOutput: matchResults.geminiOutput })
    .from(matchResults)
    .where(eq(matchResults.userId, userId))
    .orderBy(desc(matchResults.createdAt))
    .limit(1);

  const hasMatchResults =
    latestMatchResult?.geminiOutput !== null &&
    latestMatchResult?.geminiOutput !== undefined;

  return Response.json({
    hasMatchResults,
    matchResults: latestMatchResult?.geminiOutput ?? null,
  });
}

export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdForClerkUser(clerkUserId);

  if (!userId) {
    return Response.json(
      { error: "User record not found. Please refresh and try again." },
      { status: 404 },
    );
  }

  let forceRegeneration = false;

  try {
    const body = (await request.json()) as unknown;

    if (
      typeof body === "object" &&
      body !== null &&
      "force" in body &&
      body.force === true
    ) {
      forceRegeneration = true;
    }
  } catch {
    forceRegeneration = false;
  }

  const [latestMatchResult] = await db
    .select({ geminiOutput: matchResults.geminiOutput })
    .from(matchResults)
    .where(eq(matchResults.userId, userId))
    .orderBy(desc(matchResults.createdAt))
    .limit(1);

  const hasExistingResults =
    latestMatchResult?.geminiOutput !== null &&
    latestMatchResult?.geminiOutput !== undefined;

  if (hasExistingResults && !forceRegeneration) {
    return Response.json({
      hasMatchResults: true,
      generated: false,
      reused: true,
    });
  }

  const [profileRecord] = await db
    .select({
      country: studentProfiles.country,
      targetLevel: studentProfiles.targetLevel,
      intendedMajor: studentProfiles.intendedMajor,
      gpa: studentProfiles.gpa,
      gpaScale: studentProfiles.gpaScale,
      annualIncomeRange: studentProfiles.annualIncomeRange,
      englishTest: studentProfiles.englishTest,
      englishScore: studentProfiles.englishScore,
      financialAidNeed: studentProfiles.financialAidNeed,
      preferredStates: studentProfiles.preferredStates,
      targetYear: studentProfiles.targetYear,
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  if (!profileRecord) {
    return Response.json(
      {
        error: "Complete your profile before generating AI match results.",
      },
      { status: 400 },
    );
  }

  const [universityRecords, scholarshipRecords] = await Promise.all([
    db
      .select({
        id: universities.id,
        name: universities.name,
        state: universities.state,
        acceptanceRate: universities.acceptanceRate,
        minGpa: universities.minGpa,
        tuitionUsd: universities.tuitionUsd,
        financialAidAvail: universities.financialAidAvail,
        toeflMin: universities.toeflMin,
        ieltsMin: universities.ieltsMin,
        supportedMajors: universities.supportedMajors,
        applicationDeadline: universities.applicationDeadline,
        rankTier: universities.rankTier,
      })
      .from(universities),
    db
      .select({
        id: scholarships.id,
        name: scholarships.name,
        amountUsd: scholarships.amountUsd,
        renewable: scholarships.renewable,
        gpaMin: scholarships.gpaMin,
        eligibleCountries: scholarships.eligibleCountries,
        degreeLevels: scholarships.degreeLevels,
        incomeRequirement: scholarships.incomeRequirement,
        eligibleMajors: scholarships.eligibleMajors,
        deadline: scholarships.deadline,
        awardType: scholarships.awardType,
      })
      .from(scholarships),
  ]);

  if (universityRecords.length === 0 || scholarshipRecords.length === 0) {
    return Response.json(
      { error: MATCH_STATUS_ERROR_MESSAGE },
      { status: 500 },
    );
  }

  const rankedUniversities = universityRecords
    .map((university) => ({
      ...university,
      matchScore: scoreUniversity(profileRecord, university),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_UNIVERSITY_CANDIDATES);

  const rankedScholarships = scholarshipRecords
    .map((scholarship) => ({
      ...scholarship,
      matchScore: scoreScholarship(profileRecord, scholarship),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_SCHOLARSHIP_CANDIDATES);

  try {
    const geminiOutput = await generateGeminiMatchOutput(
      profileRecord,
      rankedUniversities,
      rankedScholarships,
    );

    console.log(
      "[dashboard/match-results] Generated Gemini output:",
      JSON.stringify(geminiOutput, null, 2),
    );

    await db.insert(matchResults).values({
      userId,
      rankedUniIds: rankedUniversities.map((item) => item.id),
      rankedSchIds: rankedScholarships.map((item) => item.id),
      geminiOutput,
    });

    return Response.json({
      hasMatchResults: true,
      generated: true,
      reused: false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : MATCH_GENERATION_ERROR_MESSAGE;

    return Response.json(
      { error: message || MATCH_GENERATION_ERROR_MESSAGE },
      { status: 502 },
    );
  }
}
