import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileCompletionStatus from "./ProfileCompletionStatus";

type MyProfileSectionProps = {
  view?: string | string[];
};

function resolveProfileView(view: string | string[] | undefined) {
  return Array.isArray(view) ? view[0] : view;
}

function ProfileCompletionPlaceholder() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 pt-0">
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Placeholder page for the profile completion form. Form
            implementation will be added later.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard?section=profile">Back to Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export function MyProfileSection({ view }: MyProfileSectionProps) {
  const activeView = resolveProfileView(view);

  if (activeView === "completion-form") {
    return <ProfileCompletionPlaceholder />;
  }

  return (
    <>
      <ProfileCompletionStatus />
    </>
  );
}
