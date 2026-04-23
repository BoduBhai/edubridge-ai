import type {
  ScholarshipRecord,
  ScholarshipsApiResponse,
} from "@/lib/validations/dashboard-api";

export function selectScholarships(payload: ScholarshipsApiResponse) {
  return payload.scholarships;
}

export function formatIncomeRequirement(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getDeadlineTime(scholarship: ScholarshipRecord) {
  if (!scholarship.deadline) {
    return null;
  }

  const time = new Date(scholarship.deadline).getTime();
  return Number.isNaN(time) ? null : time;
}
