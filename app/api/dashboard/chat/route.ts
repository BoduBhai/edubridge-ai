import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatMessages, matchResults, users } from "@/db/schema";
import {
  DashboardChatMessagesApiResponseSchema,
  DashboardChatRequestSchema,
  type DashboardGeminiMatchOutput,
} from "@/lib/validations/dashboard-api";

const CHAT_ERROR_MESSAGE = "Unable to process chat request.";
const MISSING_GEMINI_KEY_ERROR_MESSAGE =
  "Gemini API key is missing. Set GEMINI_API_KEY in environment variables.";
const PRIMARY_GEMINI_MODEL = "gemini-2.5-flash";
const FALLBACK_GEMINI_MODEL = "gemini-2.0-flash";
const MAX_CONTEXT_MESSAGES = 8;
const ROADMAP_PROMPT = "generate roadmap";

async function getUserIdForClerkUser(clerkUserId: string) {
  const [userRecord] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return userRecord?.id ?? null;
}

function normalizeRole(role: string): "user" | "assistant" {
  return role === "user" ? "user" : "assistant";
}

function buildSystemPrompt(matchContext: DashboardGeminiMatchOutput) {
  return [
    "You are EduBridge AI Advisor.",
    "Use the student's latest match results context to answer questions accurately.",
    "Give concise, practical admissions guidance in plain language.",
    "If asked for recommendations, ground them in strengths, improvements, roadmap tasks, and explanation notes.",
    "Do not invent universities, scholarships, deadlines, or scores that are not present in context.",
    "If context is missing for a question, say so briefly and suggest what to check next.",
    "",
    "Latest match context:",
    JSON.stringify(matchContext, null, 2),
  ].join("\n");
}

function buildConversationPrompt(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  latestUserMessage: string,
) {
  const history = messages
    .slice(-MAX_CONTEXT_MESSAGES)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");

  return `${history}\n\nUSER: ${latestUserMessage}`;
}

function buildRoadmapResponse(matchContext: DashboardGeminiMatchOutput) {
  const lines = matchContext.roadmap
    .slice()
    .sort((a, b) => a.month - b.month)
    .map((item) => `Month ${item.month}: ${item.task}`);

  if (lines.length === 0) {
    return "I could not find roadmap tasks in your latest match results.";
  }

  return `Here is your roadmap based on your latest match results:\n\n${lines.join("\n")}`;
}

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdForClerkUser(clerkUserId);

  if (!userId) {
    return Response.json({ messages: [] });
  }

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(asc(chatMessages.createdAt));

  const messages = rows.map((row) => ({
    id: row.id,
    role: normalizeRole(row.role),
    content: row.content,
    createdAt: row.createdAt,
  }));

  const payload = DashboardChatMessagesApiResponseSchema.parse({ messages });

  return Response.json(payload, {
    headers: {
      "Cache-Control": "private, no-store",
    },
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

  const payload = (await request.json().catch(() => null)) as unknown;
  const parsedRequest = DashboardChatRequestSchema.safeParse(payload);

  if (!parsedRequest.success) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  const userMessageText = parsedRequest.data.message.trim();

  if (!userMessageText) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  const [latestMatchResult] = await db
    .select({ geminiOutput: matchResults.geminiOutput })
    .from(matchResults)
    .where(eq(matchResults.userId, userId))
    .orderBy(desc(matchResults.createdAt))
    .limit(1);

  if (!latestMatchResult?.geminiOutput) {
    return Response.json(
      {
        error:
          "Generate your AI match results first. Chat works after your report is ready.",
      },
      { status: 400 },
    );
  }

  const matchContext = latestMatchResult.geminiOutput as DashboardGeminiMatchOutput;

  const [userInsert] = await db
    .insert(chatMessages)
    .values({
      userId,
      role: "user",
      content: userMessageText,
    })
    .returning({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    });

  const recentRows = await db
    .select({
      role: chatMessages.role,
      content: chatMessages.content,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(MAX_CONTEXT_MESSAGES);

  const conversation = recentRows
    .reverse()
    .map((row) => ({ role: normalizeRole(row.role), content: row.content }));

  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: MISSING_GEMINI_KEY_ERROR_MESSAGE },
      { status: 500 },
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const system = buildSystemPrompt(matchContext);
  const prompt = buildConversationPrompt(conversation, userMessageText);

  try {
    let assistantText = "";

    if (userMessageText.toLowerCase() === ROADMAP_PROMPT) {
      assistantText = buildRoadmapResponse(matchContext);
    } else {
      try {
        const { text } = await generateText({
          model: google(PRIMARY_GEMINI_MODEL),
          system,
          prompt,
        });
        assistantText = text;
      } catch {
        const { text } = await generateText({
          model: google(FALLBACK_GEMINI_MODEL),
          system,
          prompt,
        });
        assistantText = text;
      }
    }

    const normalizedAssistantText =
      assistantText.trim() || "I could not generate a response. Please try again.";

    const [assistantInsert] = await db
      .insert(chatMessages)
      .values({
        userId,
        role: "assistant",
        content: normalizedAssistantText,
      })
      .returning({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      });

    return Response.json({
      userMessage: {
        id: userInsert.id,
        role: normalizeRole(userInsert.role),
        content: userInsert.content,
        createdAt: userInsert.createdAt,
      },
      assistantMessage: {
        id: assistantInsert.id,
        role: normalizeRole(assistantInsert.role),
        content: assistantInsert.content,
        createdAt: assistantInsert.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : CHAT_ERROR_MESSAGE;
    return Response.json({ error: message || CHAT_ERROR_MESSAGE }, { status: 502 });
  }
}
