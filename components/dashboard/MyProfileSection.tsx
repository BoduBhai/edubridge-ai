"use client";

import * as React from "react";

import MyProfileInfo from "./MyProfileInfo";
import ProfileCompletionForm from "./ProfileCompletionForm";
import ProfileCompletionStatus from "./ProfileCompletionStatus";
import type { ProfileCompletionFormValues } from "./profile-completion";

type MyProfileSectionProps = {
  view?: string | string[];
};

type ProfileCompletionStatusResponse = {
  profile: ProfileCompletionFormValues | null;
  completionPercent?: number;
};

function resolveProfileView(view: string | string[] | undefined) {
  return Array.isArray(view) ? view[0] : view;
}

export function MyProfileSection({ view }: MyProfileSectionProps) {
  const activeView = resolveProfileView(view);
  const [profile, setProfile] =
    React.useState<ProfileCompletionFormValues | null>(null);
  const [completionPercent, setCompletionPercent] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (activeView === "completion-form") {
      return;
    }

    setIsLoading(true);

    const abortController = new AbortController();

    const loadCompletion = async () => {
      try {
        const response = await fetch("/api/profile-completion", {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          setProfile(null);
          setCompletionPercent(0);
          return;
        }

        const result = (await response
          .json()
          .catch(() => null)) as ProfileCompletionStatusResponse | null;

        setProfile(result?.profile ?? null);

        if (typeof result?.completionPercent === "number") {
          setCompletionPercent(
            Math.max(0, Math.min(100, result.completionPercent)),
          );
        } else {
          setCompletionPercent(0);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setProfile(null);
        setCompletionPercent(0);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadCompletion();

    return () => {
      if (!abortController.signal.aborted) {
        abortController.abort("MyProfileSection unmounted");
      }
    };
  }, [activeView]);

  if (activeView === "completion-form") {
    return <ProfileCompletionForm />;
  }

  const shouldShowProfileCompletionStatus =
    isLoading || completionPercent < 100;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 p-4">
      <MyProfileInfo
        profile={profile}
        completionPercent={completionPercent}
        isLoading={isLoading}
      />
      {shouldShowProfileCompletionStatus ? (
        <ProfileCompletionStatus
          progressPercent={completionPercent}
          isLoading={isLoading}
        />
      ) : null}
    </main>
  );
}
