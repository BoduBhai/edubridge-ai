import {
  pgTable,
  uuid,
  varchar,
  real,
  integer,
  boolean,
  text,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 120 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 80 }),
  lastName: varchar("last_name", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Universities Table
export const universities = pgTable("universities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 60 }).notNull(),
  acceptanceRate: real("acceptance_rate").notNull(),
  minGpa: real("min_gpa").notNull(),
  tuitionUsd: integer("tuition_usd").notNull(),
  financialAidAvail: boolean("financial_aid_avail").notNull().default(false),
  toeflMin: integer("toefl_min"),
  ieltsMin: real("ielts_min"),
  supportedMajors: text("supported_majors").array().notNull(),
  applicationDeadline: date("application_deadline"),
  rankTier: varchar("rank_tier", { length: 30 }),
  websiteUrl: varchar("website_url", { length: 512 }),
  descriptionText: text("description_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Scholarships Table
export const scholarships = pgTable("scholarships", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amountUsd: integer("amount_usd").notNull(),
  renewable: boolean("renewable").default(false),
  gpaMin: real("gpa_min").notNull(),
  eligibleCountries: text("eligible_countries").array().notNull(),
  degreeLevels: text("degree_levels").array().notNull(),
  incomeRequirement: varchar("income_requirement", { length: 50 }).notNull(),
  eligibleMajors: text("eligible_majors").array().notNull(),
  deadline: date("deadline"),
  awardType: varchar("award_type", { length: 50 }).notNull(),
  applicationUrl: varchar("application_url", { length: 512 }),
  universityId: uuid("university_id").references(() => universities.id), // Nullable
  descriptionText: text("description_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. Student Profiles Table
export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  country: varchar("country", { length: 80 }).notNull(),
  dateOfBirth: date("date_of_birth"),
  currentLevel: varchar("current_level", { length: 40 }).notNull(),
  targetLevel: varchar("target_level", { length: 40 }).notNull(),
  intendedMajor: varchar("intended_major", { length: 100 }).notNull(),
  gpa: real("gpa").notNull(),
  gpaScale: real("gpa_scale").notNull().default(4.0),
  annualIncomeRange: varchar("annual_income_range", { length: 40 }).notNull(),
  englishTest: varchar("english_test", { length: 30 }),
  englishScore: real("english_score"),
  financialAidNeed: varchar("financial_aid_need", { length: 30 }).notNull(),
  targetYear: varchar("target_year", { length: 10 }).notNull(),
  preferredStates: text("preferred_states").array(),
  extracurriculars: text("extracurriculars").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 5. Match Results Table
export const matchResults = pgTable("match_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  rankedUniIds: uuid("ranked_uni_ids").array(),
  rankedSchIds: uuid("ranked_sch_ids").array(),
  geminiOutput: jsonb("gemini_output"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
