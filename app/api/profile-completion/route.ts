import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { studentProfiles, users } from "@/db/schema";
import {
  calculateProfileCompletion,
  formSchema,
  type ProfileCompletionFormValues,
  upsertStudentProfileSchema,
} from "@/lib/validations/profile-completion";

function toDateInputValue(value: Date | string | null): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (directMatch) {
      return directMatch[1];
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? ""
      : parsedDate.toISOString().slice(0, 10);
  }

  return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
}

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userRecord] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!userRecord) {
    return Response.json({ profile: null, completionPercent: 0 });
  }

  const [profileRecord] = await db
    .select({
      country: studentProfiles.country,
      dateOfBirth: studentProfiles.dateOfBirth,
      currentLevel: studentProfiles.currentLevel,
      targetLevel: studentProfiles.targetLevel,
      intendedMajor: studentProfiles.intendedMajor,
      gpa: studentProfiles.gpa,
      gpaScale: studentProfiles.gpaScale,
      annualIncomeRange: studentProfiles.annualIncomeRange,
      englishTest: studentProfiles.englishTest,
      englishScore: studentProfiles.englishScore,
      financialAidNeed: studentProfiles.financialAidNeed,
      targetYear: studentProfiles.targetYear,
      preferredStates: studentProfiles.preferredStates,
      extracurriculars: studentProfiles.extracurriculars,
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userRecord.id))
    .limit(1);

  if (!profileRecord) {
    return Response.json({ profile: null, completionPercent: 0 });
  }

  const financialAidNeed =
    profileRecord.financialAidNeed === "partial_aid_ok" ||
    profileRecord.financialAidNeed === "no_aid_needed"
      ? profileRecord.financialAidNeed
      : "full_funding_required";

  const profileValues: ProfileCompletionFormValues = {
    country: profileRecord.country,
    dateOfBirth: toDateInputValue(profileRecord.dateOfBirth),
    currentLevel: profileRecord.currentLevel,
    targetLevel: profileRecord.targetLevel,
    intendedMajor: profileRecord.intendedMajor,
    gpaScale: profileRecord.gpaScale === 10 ? "10" : "4",
    gpa: String(profileRecord.gpa),
    annualIncomeRange: profileRecord.annualIncomeRange,
    financialAidNeed,
    englishTest: profileRecord.englishTest ?? "",
    englishScore:
      profileRecord.englishScore === null
        ? ""
        : String(profileRecord.englishScore),
    targetYear: profileRecord.targetYear,
    preferredStates: profileRecord.preferredStates ?? [],
    extracurriculars: profileRecord.extracurriculars ?? [],
  };

  const validatedProfile = formSchema.safeParse(profileValues);

  if (!validatedProfile.success) {
    return Response.json({ profile: null, completionPercent: 0 });
  }

  return Response.json({
    profile: validatedProfile.data,
    completionPercent: calculateProfileCompletion(validatedProfile.data),
  });
}

export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedPayload = upsertStudentProfileSchema.safeParse(body);

  if (!parsedPayload.success) {
    return Response.json(
      {
        error: "Invalid profile completion payload.",
        issues: parsedPayload.error.issues,
      },
      { status: 400 },
    );
  }

  const [userRecord] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!userRecord) {
    return Response.json(
      { error: "User record not found. Please refresh and try again." },
      { status: 404 },
    );
  }

  try {
    await db
      .insert(studentProfiles)
      .values({
        userId: userRecord.id,
        ...parsedPayload.data,
      })
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: {
          ...parsedPayload.data,
          updatedAt: new Date(),
        },
      });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error upserting student profile:", error);
    return Response.json({ error: "Database Error" }, { status: 500 });
  }
}
