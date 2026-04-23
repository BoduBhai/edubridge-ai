"use client";

import * as React from "react";
import {
  AlertTriangle,
  BarChart2,
  Calendar,
  CheckCheck,
  Clock,
  DollarSign,
  Flame,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
import ProfileCompletionStatus from "@/components/dashboard/ProfileCompletionStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DashboardChatMessagesApiResponseSchema,
  DashboardChatSendResponseSchema,
  type DashboardChatMessage,
  DashboardGeminiMatchOutputSchema,
  DashboardMatchResultsStatusResponseSchema,
  type ScholarshipRecord,
  ScholarshipsApiResponseSchema,
  type UniversityRecord,
  UniversitiesApiResponseSchema,
} from "@/lib/validations/dashboard-api";

const MATCH_STATUS_ERROR_MESSAGE =
  "Unable to load your AI match results status.";

const MATCH_GENERATION_ERROR_MESSAGE = "Unable to generate AI match results.";

const PROFILE_STATUS_ERROR_MESSAGE =
  "Unable to load your profile completion status.";
const CHAT_LOAD_ERROR_MESSAGE = "Unable to load chat history.";
const CHAT_SEND_ERROR_MESSAGE = "Unable to send your message.";

const GOLD = "#c8a96a";

const UNIVERSITIES = [
  {
    name: "Berea College",
    location: "Berea, KY",
    type: "Reach",
    acceptance: "35%",
    tuition: "$0 - Full Tuition Covered",
    reason:
      "Only US college with no tuition. Specifically funds international students from low-income families who demonstrate academic excellence.",
    logo: "BC",
    color: "#1a4a35",
    match: 97,
  },
  {
    name: "Grinnell College",
    location: "Grinnell, IA",
    type: "Reach",
    acceptance: "18%",
    tuition: "Meets 100% Demonstrated Need",
    reason:
      "Your GPA 3.7 and SAT 1340 sit in their median range. CS is a top department - strong match for merit + need awards.",
    logo: "GC",
    color: "#7c3aed",
    match: 91,
  },
  {
    name: "Georgia State Univ.",
    location: "Atlanta, GA",
    type: "Target",
    acceptance: "57%",
    tuition: "Out-of-State Waiver Available",
    reason:
      "Large CS program with dedicated international aid. Your profile qualifies for the HOPE scholarship waiver program.",
    logo: "GSU",
    color: "#b45309",
    match: 87,
  },
  {
    name: "Illinois Inst. of Tech",
    location: "Chicago, IL",
    type: "Target",
    acceptance: "62%",
    tuition: "Merit Scholarship up to $25k/yr",
    reason:
      "STEM-focused, strong OPT pipeline. Your SAT score makes you eligible for the Duchossois Leadership Scholars award.",
    logo: "IIT",
    color: "#0369a1",
    match: 83,
  },
  {
    name: "University of Toledo",
    location: "Toledo, OH",
    type: "Safety",
    acceptance: "78%",
    tuition: "Intl Merit Award: $12k/yr",
    reason:
      "Solid CS program, welcoming to Ghanaian students. Several alumni now in FAANG companies via OPT pathway.",
    logo: "UT",
    color: "#166534",
    match: 76,
  },
  {
    name: "Wright State Univ.",
    location: "Dayton, OH",
    type: "Safety",
    acceptance: "82%",
    tuition: "Presidential Scholarship: $8k/yr",
    reason:
      "Near-guaranteed admission based on your GPA. Active African Student Union and strong international office.",
    logo: "WSU",
    color: "#9f1239",
    match: 71,
  },
];

const SCHOLARSHIPS = [
  {
    name: "Mastercard Foundation Scholars",
    amount: "Full Ride + Living Stipend",
    origin: "Pan-African",
    deadline: "Dec 1, 2025",
    urgency: "high",
    potential: 85000,
  },
  {
    name: "Zawadi Africa Education Fund",
    amount: "Full Tuition",
    origin: "Ghana Eligible",
    deadline: "Nov 15, 2025",
    urgency: "critical",
    potential: 55000,
  },
  {
    name: "Global Citizen Year Scholarship",
    amount: "$10,000 / year",
    origin: "All Countries",
    deadline: "Jan 15, 2026",
    urgency: "medium",
    potential: 40000,
  },
  {
    name: "AAUW International Fellowships",
    amount: "Up to $30,000",
    origin: "Women Priority",
    deadline: "Nov 1, 2025",
    urgency: "critical",
    potential: 30000,
  },
];

const DEADLINES = [
  {
    school: "Grinnell College",
    date: "Nov 1, 2025",
    daysLeft: 15,
    type: "Early Decision",
    urgency: "critical",
  },
  {
    school: "Berea College",
    date: "Dec 1, 2025",
    daysLeft: 45,
    type: "Regular Decision",
    urgency: "high",
  },
  {
    school: "Georgia State",
    date: "Jan 15, 2026",
    daysLeft: 90,
    type: "Priority Deadline",
    urgency: "medium",
  },
  {
    school: "Illinois Tech",
    date: "Feb 1, 2026",
    daysLeft: 107,
    type: "Rolling Admission",
    urgency: "low",
  },
];

type DashboardUniversityCard = {
  name: string;
  location: string;
  type: "Reach" | "Target" | "Safety";
  acceptance: string;
  tuition: string;
  reason: string;
  logo: string;
  color: string;
  match: number;
};

type DashboardScholarshipRow = {
  name: string;
  amount: string;
  origin: string;
  deadline: string;
  urgency: string;
  potential: number;
};

type DashboardDeadlineRow = {
  school: string;
  date: string;
  daysLeft: number;
  type: string;
  urgency: string;
};

const MATCH_GRADIENT_COLORS = [
  "#1a4a35",
  "#7c3aed",
  "#b45309",
  "#0369a1",
  "#166534",
  "#9f1239",
];

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatDateLabel(value: string | Date | null) {
  if (!value) {
    return "Rolling";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Rolling";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(value: string | Date | null) {
  if (!value) {
    return 180;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 180;
  }

  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

function urgencyFromDays(daysLeft: number) {
  if (daysLeft <= 30) return "critical";
  if (daysLeft <= 60) return "high";
  if (daysLeft <= 120) return "medium";
  return "low";
}

function tierFromIndex(index: number, total: number): "Reach" | "Target" | "Safety" {
  const firstCutoff = Math.max(1, Math.ceil(total / 3));
  const secondCutoff = Math.max(firstCutoff + 1, Math.ceil((2 * total) / 3));

  if (index < firstCutoff) return "Reach";
  if (index < secondCutoff) return "Target";
  return "Safety";
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function tierColor(type: string) {
  if (type === "Reach") {
    return {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
    };
  }

  if (type === "Target") {
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    };
  }

  return {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  };
}

function urgencyColor(urgency: string) {
  if (urgency === "critical") {
    return {
      bar: "bg-red-500",
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <Flame className="h-3 w-3" />,
    };
  }

  if (urgency === "high") {
    return {
      bar: "bg-orange-400",
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: <AlertTriangle className="h-3 w-3" />,
    };
  }

  if (urgency === "medium") {
    return {
      bar: "bg-yellow-400",
      text: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: <Clock className="h-3 w-3" />,
    };
  }

  return {
    bar: "bg-green-400",
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCheck className="h-3 w-3" />,
  };
}

function parseCompletionPercent(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "completionPercent" in payload
  ) {
    const value = payload.completionPercent;
    if (typeof value === "number") {
      return Math.max(0, Math.min(100, value));
    }
  }

  return 0;
}

export function DashboardSection() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [completionPercent, setCompletionPercent] = React.useState(0);
  const [isMatchStatusLoading, setIsMatchStatusLoading] = React.useState(false);
  const [matchStatusError, setMatchStatusError] = React.useState<string | null>(
    null,
  );
  const [generationError, setGenerationError] = React.useState<string | null>(
    null,
  );
  const [hasMatchResults, setHasMatchResults] = React.useState(false);
  const [isGeneratingMatchResults, setIsGeneratingMatchResults] =
    React.useState(false);
  const [geminiMatchOutput, setGeminiMatchOutput] = React.useState<
    ReturnType<typeof DashboardGeminiMatchOutputSchema.parse> | null
  >(null);
  const [universityRecords, setUniversityRecords] = React.useState<
    UniversityRecord[]
  >([]);
  const [scholarshipRecords, setScholarshipRecords] = React.useState<
    ScholarshipRecord[]
  >([]);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<DashboardChatMessage[]>(
    [],
  );
  const [chatError, setChatError] = React.useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isChatSending, setIsChatSending] = React.useState(false);
  const [typingMessageId, setTypingMessageId] = React.useState<string | null>(
    null,
  );
  const typingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const stopTypingAnimation = React.useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingMessageId(null);
  }, []);

  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const loadMatchStatus = React.useCallback(async (signal?: AbortSignal) => {
    try {
      setIsMatchStatusLoading(true);
      setMatchStatusError(null);

      const response = await fetch("/api/dashboard/match-results", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(MATCH_STATUS_ERROR_MESSAGE);
      }

      const payload: unknown = await response.json();
      const parsed =
        DashboardMatchResultsStatusResponseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error(MATCH_STATUS_ERROR_MESSAGE);
      }

      setHasMatchResults(parsed.data.hasMatchResults);
      setGeminiMatchOutput(parsed.data.matchResults ?? null);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setHasMatchResults(false);
      setGeminiMatchOutput(null);
      setMatchStatusError(
        error instanceof Error ? error.message : MATCH_STATUS_ERROR_MESSAGE,
      );
    } finally {
      if (!signal?.aborted) {
        setIsMatchStatusLoading(false);
      }
    }
  }, []);

  const loadCatalogData = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const [universitiesResponse, scholarshipsResponse] = await Promise.all([
        fetch("/api/dashboard/universities", {
          method: "GET",
          cache: "no-store",
          signal,
        }),
        fetch("/api/dashboard/scholarships", {
          method: "GET",
          cache: "no-store",
          signal,
        }),
      ]);

      if (!universitiesResponse.ok || !scholarshipsResponse.ok) {
        return;
      }

      const universitiesPayload: unknown = await universitiesResponse.json();
      const scholarshipsPayload: unknown = await scholarshipsResponse.json();

      const parsedUniversities =
        UniversitiesApiResponseSchema.safeParse(universitiesPayload);
      const parsedScholarships =
        ScholarshipsApiResponseSchema.safeParse(scholarshipsPayload);

      if (parsedUniversities.success) {
        setUniversityRecords(parsedUniversities.data.universities);
      }

      if (parsedScholarships.success) {
        setScholarshipRecords(parsedScholarships.data.scholarships);
      }
    } catch {
      // Keep static fallback content if lookup calls fail.
    }
  }, []);

  const loadChatHistory = React.useCallback(async (signal?: AbortSignal) => {
    try {
      setIsChatLoading(true);
      setChatError(null);

      const response = await fetch("/api/dashboard/chat", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(CHAT_LOAD_ERROR_MESSAGE);
      }

      const payload: unknown = await response.json();
      const parsed = DashboardChatMessagesApiResponseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error(CHAT_LOAD_ERROR_MESSAGE);
      }

      setChatMessages(parsed.data.messages);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setChatError(error instanceof Error ? error.message : CHAT_LOAD_ERROR_MESSAGE);
    } finally {
      if (!signal?.aborted) {
        setIsChatLoading(false);
      }
    }
  }, []);

  const submitChatMessage = React.useCallback(
    async (rawMessage: string) => {
      const message = rawMessage.trim();

      if (!message || isChatSending) {
        return;
      }

      try {
        setIsChatSending(true);
        setChatError(null);
        stopTypingAnimation();

        const response = await fetch("/api/dashboard/chat", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? CHAT_SEND_ERROR_MESSAGE);
        }

        const payload: unknown = await response.json();
        const parsed = DashboardChatSendResponseSchema.safeParse(payload);

        if (!parsed.success) {
          throw new Error(CHAT_SEND_ERROR_MESSAGE);
        }

        setChatMessages((prev) => [...prev, parsed.data.userMessage]);
        const assistantMessage = parsed.data.assistantMessage;
        const words = assistantMessage.content.split(/\s+/).filter(Boolean);

        setChatMessages((prev) => [
          ...prev,
          { ...assistantMessage, content: "" },
        ]);
        setTypingMessageId(assistantMessage.id);

        if (words.length === 0) {
          setChatMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id ? assistantMessage : message,
            ),
          );
          setTypingMessageId(null);
        } else {
          let index = 0;
          typingTimerRef.current = setInterval(() => {
            index += 1;

            setChatMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessage.id
                  ? {
                      ...message,
                      content: words.slice(0, index).join(" "),
                    }
                  : message,
              ),
            );

            if (index >= words.length) {
              stopTypingAnimation();
            }
          }, 35);
        }

        setChatInput("");
      } catch (error) {
        setChatError(
          error instanceof Error ? error.message : CHAT_SEND_ERROR_MESSAGE,
        );
      } finally {
        setIsChatSending(false);
      }
    },
    [isChatSending, stopTypingAnimation],
  );

  const handleSendChatMessage = React.useCallback(async () => {
    await submitChatMessage(chatInput);
  }, [chatInput, submitChatMessage]);

  const parseRoadmapSteps = React.useCallback((content: string) => {
    const matches = content.match(/Month\s+\d+\s*:\s*[^]+?(?=Month\s+\d+\s*:|$)/gi);
    if (!matches || matches.length === 0) {
      return null;
    }

    return matches.map((step) => step.trim());
  }, []);

  React.useEffect(() => {
    const abortController = new AbortController();

    const loadProfileStatus = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch("/api/profile-completion", {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(PROFILE_STATUS_ERROR_MESSAGE);
        }

        const payload = (await response.json().catch(() => null)) as unknown;
        setCompletionPercent(parseCompletionPercent(payload));
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setCompletionPercent(0);
        setFetchError(
          error instanceof Error ? error.message : PROFILE_STATUS_ERROR_MESSAGE,
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfileStatus();

    return () => {
      abortController.abort();
    };
  }, []);

  React.useEffect(() => {
    if (isLoading || fetchError || completionPercent < 100) {
      return;
    }

    const abortController = new AbortController();
    void loadMatchStatus(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [completionPercent, fetchError, isLoading, loadMatchStatus]);

  React.useEffect(() => {
    if (!hasMatchResults) {
      return;
    }

    const abortController = new AbortController();
    void loadCatalogData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [hasMatchResults, loadCatalogData]);

  React.useEffect(() => {
    if (!isChatDialogOpen || !hasMatchResults) {
      return;
    }

    const abortController = new AbortController();
    void loadChatHistory(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [hasMatchResults, isChatDialogOpen, loadChatHistory]);

  const handleGenerateMatchResults = React.useCallback(async () => {
    if (isGeneratingMatchResults) {
      return;
    }

    try {
      setIsGeneratingMatchResults(true);
      setGenerationError(null);

      const response = await fetch("/api/dashboard/match-results", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(payload?.error ?? MATCH_GENERATION_ERROR_MESSAGE);
      }

      await loadMatchStatus();
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : MATCH_GENERATION_ERROR_MESSAGE,
      );
    } finally {
      setIsGeneratingMatchResults(false);
    }
  }, [isGeneratingMatchResults, loadMatchStatus]);

  const displayUniversities = React.useMemo(() => {
    if (!geminiMatchOutput || universityRecords.length === 0) {
      return UNIVERSITIES;
    }

    const recordsById = new Map(universityRecords.map((item) => [item.id, item]));

    const mapped: DashboardUniversityCard[] = [];

    geminiMatchOutput.universityExplanations.forEach((item, index, arr) => {
        const university = recordsById.get(item.id);
        if (!university) return;

        mapped.push({
          name: university.name,
          location: university.state,
          type: tierFromIndex(index, arr.length),
          acceptance: `${Math.round(university.acceptanceRate)}%`,
          tuition: `${formatUsd(university.tuitionUsd)} / year`,
          reason: item.explanation,
          logo: initialsFromName(university.name),
          color: MATCH_GRADIENT_COLORS[index % MATCH_GRADIENT_COLORS.length],
          match: Math.max(60, Math.min(99, 95 - index * 2)),
        });
      });

    return mapped.length > 0 ? mapped : UNIVERSITIES;
  }, [geminiMatchOutput, universityRecords]);

  const displayScholarships = React.useMemo(() => {
    if (!geminiMatchOutput || scholarshipRecords.length === 0) {
      return SCHOLARSHIPS;
    }

    const recordsById = new Map(scholarshipRecords.map((item) => [item.id, item]));

    const mapped: DashboardScholarshipRow[] = [];

    geminiMatchOutput.scholarshipExplanations.forEach((item) => {
        const scholarship = recordsById.get(item.id);

        if (!scholarship) return;

        const daysLeft = daysUntil(scholarship.deadline);

        mapped.push({
          name: scholarship.name,
          amount: formatUsd(scholarship.amountUsd),
          origin: scholarship.awardType || "General",
          deadline: formatDateLabel(scholarship.deadline),
          urgency: urgencyFromDays(daysLeft),
          potential: scholarship.amountUsd,
        });
      });

    return mapped.length > 0 ? mapped : SCHOLARSHIPS;
  }, [geminiMatchOutput, scholarshipRecords]);

  const displayDeadlines = React.useMemo(() => {
    if (universityRecords.length > 0 && geminiMatchOutput) {
      const recordsById = new Map(universityRecords.map((item) => [item.id, item]));

      const mapped: DashboardDeadlineRow[] = [];

      geminiMatchOutput.universityExplanations.slice(0, 4).forEach((item) => {
          const university = recordsById.get(item.id);
          if (!university) return;

          const daysLeft = daysUntil(university.applicationDeadline);

          mapped.push({
            school: university.name,
            date: formatDateLabel(university.applicationDeadline),
            daysLeft,
            type: university.rankTier ?? "Application Deadline",
            urgency: urgencyFromDays(daysLeft),
          });
        });

      if (mapped.length > 0) {
        return mapped;
      }
    }

    if (!geminiMatchOutput) {
      return DEADLINES;
    }

    return geminiMatchOutput.roadmap.slice(0, 4).map((item) => {
      const daysLeft = item.month * 30;
      return {
        school: `Roadmap Month ${item.month}`,
        date: `Month ${item.month}`,
        daysLeft,
        type: item.task,
        urgency: urgencyFromDays(daysLeft),
      };
    });
  }, [geminiMatchOutput, universityRecords]);

  const dashboardStats = React.useMemo(() => {
    const universityCount = displayUniversities.length;
    const scholarshipCount = displayScholarships.length;
    const totalAid = displayScholarships.reduce(
      (sum, scholarship) => sum + scholarship.potential,
      0,
    );

    const profileStrengthScore = geminiMatchOutput
      ? Math.max(
          60,
          Math.min(
            99,
            78 +
              geminiMatchOutput.strengths.length * 4 -
              geminiMatchOutput.improvements.length * 2,
          ),
        )
      : 94;

    return {
      profileStrengthScore,
      universityCount,
      scholarshipCount,
      totalAid,
    };
  }, [displayScholarships, displayUniversities.length, geminiMatchOutput]);

  const totalPotentialFunding = dashboardStats.totalAid;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="min-h-64">
          <CardContent className="flex min-h-64 items-center justify-center">
            <LoadingSpinner label="Checking your profile completion..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Dashboard Preview Unavailable</CardTitle>
            <CardDescription>{fetchError}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (completionPercent < 100) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ProfileCompletionStatus
          progressPercent={completionPercent}
          isLoading={false}
        />
      </div>
    );
  }

  if (isMatchStatusLoading || isGeneratingMatchResults) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="min-h-64">
          <CardContent className="flex min-h-64 items-center justify-center">
            <LoadingSpinner
              label={
                isGeneratingMatchResults
                  ? "Gemini AI is generating your match results..."
                  : "Checking your AI match results..."
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (matchStatusError) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>AI Match Results</CardTitle>
            <CardDescription>{matchStatusError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => void loadMatchStatus()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasMatchResults) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>AI Match Results</CardTitle>
            <CardDescription>
              No match results found for your account yet. Generate your AI
              match report to unlock this section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {generationError ? (
              <p className="text-sm text-red-600">{generationError}</p>
            ) : null}
            <Button
              type="button"
              onClick={handleGenerateMatchResults}
              disabled={isGeneratingMatchResults}
            >
              Generate AI Match Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-2xl font-semibold">
                  Your AI Match Report
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {dashboardStats.universityCount} universities matched and{" "}
                  {formatUsd(dashboardStats.totalAid)} in potential funding found
                </p>
              </div>
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 cursor-pointer gap-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Re-run Analysis
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Match Score",
                  value: `${dashboardStats.profileStrengthScore}%`,
                  sub: "Profile strength",
                  className: "bg-primary/5 text-primary",
                },
                {
                  label: "Universities",
                  value: String(dashboardStats.universityCount),
                  sub: "Personalized matches",
                  className: "bg-violet-50 text-violet-700",
                },
                {
                  label: "Scholarships",
                  value: String(dashboardStats.scholarshipCount),
                  sub: "You qualify for",
                  className: "bg-orange-50 text-orange-700",
                },
                {
                  label: "Total Aid",
                  value:
                    totalPotentialFunding >= 1000
                      ? `$${Math.round(totalPotentialFunding / 1000)}k`
                      : formatUsd(totalPotentialFunding),
                  sub: "Potential funding",
                  className: "bg-blue-50 text-blue-700",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl p-4 ${stat.className.split(" ")[0]}`}
                >
                  <p className="text-muted-foreground text-xs font-medium">
                    {stat.label}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold ${stat.className.split(" ")[1]}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {(["Reach", "Target", "Safety"] as const).map((tier) => (
              <div key={tier} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-sm font-bold ${tierColor(tier).bg} ${tierColor(tier).text} ${tierColor(tier).border}`}
                  >
                    {tier} Schools
                  </span>
                  <div className="bg-border h-px flex-1" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {displayUniversities.filter(
                    (university) => university.type === tier,
                  ).map((university) => (
                    <Card
                      key={university.name}
                      className="bg-card group overflow-hidden transition-all hover:shadow-md"
                    >
                      <div
                        className="h-1"
                        style={{
                          background: `linear-gradient(90deg, ${university.color}, ${GOLD})`,
                        }}
                      />
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start gap-3">
                          <div
                            className="text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                            style={{ background: university.color }}
                          >
                            {university.logo}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                              {university.name}
                            </h3>
                            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                              <MapPin className="h-3 w-3" />
                              {university.location}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-primary text-sm font-bold">
                              {university.match}%
                            </div>
                            <div className="text-muted-foreground text-xs">
                              match
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 space-y-1.5">
                          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <Users className="h-3 w-3 shrink-0" />
                            <span>
                              Acceptance:{" "}
                              <span className="text-foreground font-medium">
                                {university.acceptance}
                              </span>
                            </span>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            <span className="text-foreground font-medium">
                              {university.tuition}
                            </span>
                          </div>
                        </div>

                        <div className="bg-muted/40 mb-3 rounded-lg p-2.5">
                          <div className="flex items-start gap-1.5">
                            <Sparkles
                              className="mt-0.5 h-3 w-3 shrink-0"
                              style={{ color: GOLD }}
                            />
                            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                              {university.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 flex-1 text-xs"
                          >
                            View Details
                          </Button>
                          <Button size="sm" className="h-7 px-2 text-xs">
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <DollarSign className="h-5 w-5" style={{ color: GOLD }} />
                  Scholarship Stacker
                </h2>
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700">
                    Total Potential:
                  </span>
                  <span className="text-sm font-bold text-green-800">
                    ${totalPotentialFunding.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {displayScholarships.map((scholarship) => {
                  const urgency = urgencyColor(scholarship.urgency);

                  return (
                    <div
                      key={scholarship.name}
                      className={`bg-card flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${urgency.border}`}
                    >
                      <div
                        className={`w-1 self-stretch rounded-full ${urgency.bar}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-foreground text-sm font-semibold">
                            {scholarship.name}
                          </h3>
                          <Badge
                            className={`h-5 border text-xs ${urgency.bg} ${urgency.text} ${urgency.border} font-normal`}
                          >
                            {urgency.icon}
                            <span className="ml-1">{scholarship.origin}</span>
                          </Badge>
                        </div>

                        <div className="mt-1 flex items-center gap-4">
                          <span className="text-primary text-sm font-bold">
                            {scholarship.amount}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs ${urgency.text} font-medium`}
                          >
                            <Calendar className="h-3 w-3" />
                            {scholarship.deadline}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          ${scholarship.potential.toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5 xl:col-span-1">
            <Card className="bg-card">
              <CardHeader className="border-border border-b pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Clock className="text-primary h-4 w-4" />
                  Deadline Countdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Favorited schools - Fall 2026
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {displayDeadlines.map((deadline, index) => {
                  const urgency = urgencyColor(deadline.urgency);

                  return (
                    <div
                      key={deadline.school}
                      className="border-border hover:bg-muted/40 flex gap-3 border-b px-4 py-3 transition-colors last:border-0"
                    >
                      <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${urgency.bar}`}
                        />
                        {index < displayDeadlines.length - 1 && (
                          <div className="bg-border min-h-5 w-px flex-1" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {deadline.school}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {deadline.type}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${urgency.text}`}
                          >
                            {urgency.icon}
                            {deadline.daysLeft} days left
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {deadline.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <MessageSquare className="text-primary h-4 w-4" />
                  EduBridge AI Advisor
                </CardTitle>
                <CardDescription className="text-xs">
                  Ask questions using your generated match report context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Open AI Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-6xl lg:max-w-7xl">
                    <DialogHeader>
                      <DialogTitle>Chat with EduBridge AI</DialogTitle>
                      <DialogDescription>
                        Responses are grounded in your latest AI match results.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted/30 max-h-[70vh] min-h-[55vh] space-y-3 overflow-y-auto rounded-md border p-4">
                      {isChatLoading ? (
                        <LoadingSpinner label="Loading chat history..." />
                      ) : chatMessages.length > 0 ? (
                        chatMessages.map((message) => {
                          const roadmapSteps =
                            message.role === "assistant"
                              ? parseRoadmapSteps(message.content)
                              : null;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {message.role === "assistant" && (
                                <div className="bg-primary mt-1 mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                  <Sparkles className="text-primary-foreground h-3 w-3" />
                                </div>
                              )}
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                  message.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-card text-foreground rounded-tl-sm shadow-sm"
                                }`}
                              >
                                {roadmapSteps ? (
                                  <div className="space-y-2">
                                    <p className="text-primary text-sm font-semibold">
                                      Your roadmap (step by step)
                                    </p>
                                    <div className="space-y-2">
                                      {roadmapSteps.map((step) => (
                                        <div
                                          key={step}
                                          className="rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                                        >
                                          {step}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                                {typingMessageId === message.id ? (
                                  <span className="text-muted-foreground mt-1 inline-block text-xs">
                                    Typing...
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-sm">
                            No messages yet. Ask your first question.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            className="w-fit bg-primary hover:bg-primary/90 h-9 px-4 text-primary-foreground shadow-sm"
                            onClick={() => void submitChatMessage("generate roadmap")}
                            disabled={isChatSending || isChatLoading}
                          >
                            Generate roadmap
                          </Button>
                        </div>
                      )}
                    </div>

                    {chatError ? (
                      <p className="text-sm text-red-600">{chatError}</p>
                    ) : null}

                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        placeholder="Ask about universities, scholarships, or your roadmap..."
                        className="h-10 flex-1 text-base"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void handleSendChatMessage();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-10 w-10 shrink-0 p-0"
                        onClick={() => void handleSendChatMessage()}
                        disabled={isChatSending || isChatLoading}
                      >
                        {isChatSending ? (
                          <LoadingSpinner
                            label=""
                            className="gap-0"
                            spinnerClassName="size-4"
                          />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="space-y-3 p-4">
                <p className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <BarChart2 className="text-primary h-4 w-4" />
                  Profile Strength
                </p>
                {[
                  { label: "Academic Score", value: 87 },
                  { label: "Financial Need", value: 95 },
                  { label: "English Proficiency", value: 78 },
                  { label: "Profile Completeness", value: completionPercent },
                ].map((profileMetric) => (
                  <div key={profileMetric.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {profileMetric.label}
                      </span>
                      <span className="text-primary font-semibold">
                        {profileMetric.value}%
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${profileMetric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
