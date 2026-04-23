"use client";

import * as React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { ProfileCompletionFormValues } from "./profile-completion";

type MyProfileInfoProps = {
  profile: ProfileCompletionFormValues | null;
  completionPercent: number;
  isLoading: boolean;
};

type ProfileInfoItem = {
  label: string;
  value: string;
  isPresent: boolean;
};

function hasContent(value: string) {
  return value.trim().length > 0;
}

function formatDateForDisplay(value: string) {
  if (!hasContent(value)) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString();
}

function financialAidLabel(value: string) {
  switch (value) {
    case "partial_aid_ok":
      return "Partial Aid OK";
    case "no_aid_needed":
      return "No Aid Needed";
    case "full_funding_required":
      return "Full Funding Required";
    default:
      return "";
  }
}

function formatEnglishDetails(profile: ProfileCompletionFormValues | null) {
  const test = profile?.englishTest ?? "";
  const score = profile?.englishScore ?? "";

  if (hasContent(test) && hasContent(score)) {
    return `${test} (${score})`;
  }

  if (hasContent(test)) {
    return test;
  }

  if (hasContent(score)) {
    return `Score: ${score}`;
  }

  return "";
}

function toInfoItems(
  profile: ProfileCompletionFormValues | null,
): ProfileInfoItem[] {
  const gpa = profile?.gpa ?? "";
  const gpaScale = profile?.gpaScale ?? "";
  const gpaSummary =
    hasContent(gpa) && hasContent(gpaScale) ? `${gpa} / ${gpaScale}` : "";

  const preferredStates = (profile?.preferredStates ?? []).join(", ");
  const extracurriculars = (profile?.extracurriculars ?? []).join(", ");

  const items = [
    { label: "Country", value: profile?.country ?? "" },
    {
      label: "Date of Birth",
      value: formatDateForDisplay(profile?.dateOfBirth ?? ""),
    },
    { label: "Current Level", value: profile?.currentLevel ?? "" },
    { label: "Target Degree", value: profile?.targetLevel ?? "" },
    { label: "Intended Major", value: profile?.intendedMajor ?? "" },
    { label: "GPA", value: gpaSummary },
    {
      label: "Annual Family Income",
      value: profile?.annualIncomeRange ?? "",
    },
    {
      label: "Financial Aid Need",
      value: financialAidLabel(profile?.financialAidNeed ?? ""),
    },
    { label: "English Test", value: formatEnglishDetails(profile) },
    { label: "Target Enrollment Year", value: profile?.targetYear ?? "" },
    { label: "Preferred States", value: preferredStates },
    { label: "Extracurriculars", value: extracurriculars },
  ];

  return items.map((item) => ({
    ...item,
    isPresent: hasContent(item.value),
  }));
}

function getInitials(fullName: string) {
  const tokens = fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) {
    return "U";
  }

  return tokens.map((token) => token[0]?.toUpperCase() ?? "").join("");
}

export default function MyProfileInfo({
  profile,
  completionPercent,
  isLoading,
}: MyProfileInfoProps) {
  const { user } = useUser();

  const userName =
    user?.fullName ||
    user?.username ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "No email";
  const userAvatar = user?.imageUrl ?? "";

  const infoItems = React.useMemo(() => toInfoItems(profile), [profile]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-16">
          <LoadingSpinner label="Loading your profile info..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {hasContent(userAvatar) ? (
                <AvatarImage src={userAvatar} alt={`${userName} avatar`} />
              ) : null}
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">My Profile Info</CardTitle>
              <CardDescription className="pt-1">
                {userName} • {userEmail}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge
                  variant={completionPercent === 100 ? "default" : "secondary"}
                >
                  {completionPercent}% complete
                </Badge>
                <Badge
                  variant={completionPercent === 100 ? "secondary" : "outline"}
                >
                  {completionPercent === 100
                    ? "Profile complete"
                    : "Information missing"}
                </Badge>
              </div>
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard?section=profile&view=completion-form">
              {completionPercent === 100
                ? "Update Profile"
                : "Complete Profile"}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="bg-primary/5 border-border/60 rounded-lg border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.label}</p>
              <Badge variant={item.isPresent ? "secondary" : "outline"}>
                {item.isPresent ? "Added" : "Missing"}
              </Badge>
            </div>
            <p
              className={`mt-2 text-sm ${
                item.isPresent
                  ? "text-foreground"
                  : "text-muted-foreground italic"
              }`}
            >
              {item.isPresent ? item.value : "Not added yet"}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
