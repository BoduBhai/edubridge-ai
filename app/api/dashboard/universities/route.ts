import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { universities } from "@/db/schema";

const getCachedUniversities = unstable_cache(
  async () => db.select().from(universities),
  ["dashboard-universities"],
  { revalidate: 3600 },
);

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await getCachedUniversities();

  return Response.json(
    { universities: records },
    {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
