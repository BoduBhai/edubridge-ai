"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProfileCompletionStatus() {
  const progressPercent = 25;

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="border-b text-center font-semibold uppercase">
          Profile Completion Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="pb-2">
          Complete your profile to unlock AI-powered features. Our AI generates
          better results when it has more information about you.
        </p>
        <div className="bg-accent/50 border-muted w-full max-w-sm rounded-md border-2 p-4">
          <div className="flex items-center text-sm font-medium">
            <span>Completion Progress</span>
            <span className="ml-auto">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} id="progress-upload" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="default" size="lg" className="w-full" asChild>
          <Link href="/dashboard?section=profile&view=completion-form">
            Complete Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
