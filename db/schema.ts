import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 120 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 80 }),
  lastName: varchar("last_name", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow(),
});
