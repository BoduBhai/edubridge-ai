import type {
  UniversitiesApiResponse,
  UniversityRecord,
} from "@/lib/validations/dashboard-api";

export function selectUniversities(payload: UniversitiesApiResponse) {
  return payload.universities;
}

export function getDeadlineTime(university: UniversityRecord) {
  if (!university.applicationDeadline) {
    return null;
  }

  const time = new Date(university.applicationDeadline).getTime();
  return Number.isNaN(time) ? null : time;
}
