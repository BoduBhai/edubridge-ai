import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { scholarships } from "@/db/schema";

const getCachedScholarships = unstable_cache(
  async () => db.select().from(scholarships),
  ["dashboard-scholarships"],
  { revalidate: 3600 },
);

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await getCachedScholarships();

  return Response.json(
    { scholarships: records },
    {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
