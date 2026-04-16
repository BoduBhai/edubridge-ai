import "dotenv/config";
import { schSeedData, uniSeedData } from "./data";
import { db } from "./index";
import * as schema from "./schema";

async function main() {
  console.log("🌱 Starting EduBridge AI database seeding...");

  // 2. Production Safety Guards
  const isDevelopment = process.env.NODE_ENV === "development";
  const isOptedIn = process.env.ALLOW_DB_SEED === "true";
  const isForceRun = process.argv.includes("--force");

  if (!isDevelopment && !isOptedIn && !isForceRun) {
    console.error(
      "❌ Refusing to run destructive seed. Set ALLOW_DB_SEED='true', run with --force, or use NODE_ENV='development'.",
    );
    process.exit(1);
  }

  try {
    console.log("🧹 Clearing existing data...");

    // Order matters: delete child tables before parent tables to prevent foreign key errors.
    await db.delete(schema.chatMessages);
    await db.delete(schema.matchResults);
    await db.delete(schema.studentProfiles);
    await db.delete(schema.scholarships);
    await db.delete(schema.universities);
    await db.delete(schema.users);

    console.log(`🏫 Inserting ${uniSeedData.length} universities...`);
    await db.insert(schema.universities).values(uniSeedData);

    console.log(`🎓 Inserting ${schSeedData.length} scholarships...`);
    await db.insert(schema.scholarships).values(schSeedData);

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

main();
