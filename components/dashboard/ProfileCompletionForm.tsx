"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import LoadingSpinner from "../LoadingSpinner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  annualIncomeOptions,
  countryOptions,
  educationLevelOptions,
  englishTestOptions,
  extracurricularOptions,
  financialAidNeedOptions,
  formSchema,
  majorOptions,
  preferredStateOptions,
  targetLevelOptions,
  targetYearOptions,
} from "./profile-completion";
import type { ProfileCompletionFormValues } from "./profile-completion";

export default function ProfileCompletionForm() {
  const router = useRouter();
  const [isHydrating, setIsHydrating] = React.useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileCompletionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "",
      dateOfBirth: "",
      currentLevel: "",
      targetLevel: "",
      intendedMajor: "",
      gpaScale: "4",
      gpa: "",
      annualIncomeRange: "",
      financialAidNeed: "full_funding_required",
      englishTest: "",
      englishScore: "",
      targetYear: "2026",
      preferredStates: [],
      extracurriculars: [],
    },
  });

  React.useEffect(() => {
    const abortController = new AbortController();

    const hydrateForm = async () => {
      try {
        const response = await fetch("/api/profile-completion", {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json().catch(() => null)) as {
          profile?: ProfileCompletionFormValues | null;
        } | null;

        if (result?.profile) {
          reset(result.profile);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsHydrating(false);
        }
      }
    };

    void hydrateForm();

    return () => {
      abortController.abort();
    };
  }, [reset]);

  if (isHydrating) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4">
        <Card>
          <CardContent className="py-16">
            <LoadingSpinner label="Loading your saved profile..." />
          </CardContent>
        </Card>
      </main>
    );
  }

  async function onSubmit(data: ProfileCompletionFormValues) {
    try {
      const response = await fetch("/api/profile-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        toast.error(
          result?.error ?? "Failed to save profile. Please try again.",
        );
        return;
      }

      toast.success("Profile saved successfully.");
      router.push("/dashboard?section=profile");
      router.refresh();
    } catch {
      toast.error("Network error while saving profile. Please try again.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="**:data-[slot=field-label]:text-base **:data-[slot=field-label]:font-semibold"
      >
        {/* Personal background */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Personal Background
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-xl">
              Tell us about your background so we can find universities that
              match your nationality and academic level.
            </CardDescription>
          </CardHeader>
          <Separator className="my-4" />
          <CardContent className="mx-auto w-full space-y-4">
            <Field className="w-full">
              <FieldLabel>
                Country of Origin <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.country}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {countryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>Choose your nationality.</FieldDescription>
              <FieldError errors={[errors.country]} />
            </Field>
            <Field className="w-full">
              <FieldLabel>Date of Birth</FieldLabel>
              <Input
                type="date"
                aria-invalid={!!errors.dateOfBirth}
                {...register("dateOfBirth")}
              />
              <FieldError errors={[errors.dateOfBirth]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  Current Education Level{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="currentLevel"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.currentLevel}>
                        <SelectValue placeholder="Choose level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {educationLevelOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>
                  Your most recent completed level.
                </FieldDescription>
                <FieldError errors={[errors.currentLevel]} />
              </Field>
              <Field>
                <FieldLabel>
                  Target Degree Level{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="targetLevel"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.targetLevel}>
                        <SelectValue placeholder="Choose target degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {targetLevelOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>
                  Degree you want to pursue next.
                </FieldDescription>
                <FieldError errors={[errors.targetLevel]} />
              </Field>
            </div>
          </CardContent>
        </Card>
        {/* Academic Profile */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Academic Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-xl">
              Tell us about your academic background so we can find universities
            </CardDescription>
          </CardHeader>
          <Separator className="my-4" />
          <CardContent className="mx-auto w-full space-y-4">
            <Field className="w-full">
              <FieldLabel>
                Intended Major <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="intendedMajor"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.intendedMajor}>
                      <SelectValue placeholder="Choose major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {majorOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                Field you plan to specialize in.
              </FieldDescription>
              <FieldError errors={[errors.intendedMajor]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  GPA Scale <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="gpaScale"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.gpaScale}>
                        <SelectValue placeholder="Select scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="4">4.0</SelectItem>
                          <SelectItem value="10">10.0</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>
                  Scale used in your transcripts.
                </FieldDescription>
                <FieldError errors={[errors.gpaScale]} />
              </Field>
              <Field>
                <FieldLabel>
                  Current GPA <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={!!errors.gpa}
                  {...register("gpa")}
                />
                <FieldDescription>
                  Enter GPA value matching your selected scale.
                </FieldDescription>
                <FieldError errors={[errors.gpa]} />
              </Field>
            </div>
          </CardContent>
        </Card>
        {/* Financial & Language */}
        <Card className="mt-4">
          <CardHeader>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Step 3 of 4
            </p>
            <CardTitle className="text-2xl font-bold">
              Financial & Language
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-xl">
              Your financial situation and English proficiency help us find
              scholarships you can actually receive.
            </CardDescription>
          </CardHeader>
          <Separator className="my-4" />
          <CardContent className="mx-auto w-full space-y-6">
            <Field className="w-full">
              <FieldLabel>
                Annual Family Income (USD){" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="annualIncomeRange"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.annualIncomeRange}>
                      <SelectValue placeholder="Select annual income range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {annualIncomeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                This determines your Expected Family Contribution used in
                financial aid matching.
              </FieldDescription>
              <FieldError errors={[errors.annualIncomeRange]} />
            </Field>

            <Field className="w-full">
              <FieldLabel>
                Financial Aid Need <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="financialAidNeed"
                render={({ field }) => (
                  <div className="grid gap-3 md:grid-cols-3">
                    {financialAidNeedOptions.map((option) => {
                      const isActive = field.value === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`rounded-xl border p-4 text-left transition ${
                            isActive
                              ? "border-emerald-700 bg-emerald-50"
                              : "border-border bg-background hover:bg-muted/40"
                          }`}
                        >
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError errors={[errors.financialAidNeed]} />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>English Proficiency Test</FieldLabel>
                <Controller
                  control={control}
                  name="englishTest"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.englishTest}>
                        <SelectValue placeholder="Select test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {englishTestOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.englishTest]} />
              </Field>

              <Field>
                <FieldLabel>English Score</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  aria-invalid={!!errors.englishScore}
                  {...register("englishScore")}
                />
                <FieldError errors={[errors.englishScore]} />
              </Field>
            </div>
          </CardContent>
        </Card>
        {/* Preferences */}
        <Card className="mt-4">
          <CardHeader>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Step 4 of 4
            </p>
            <CardTitle className="text-2xl font-bold">Preferences</CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-xl">
              Last step. Set your preferences to personalize recommendations.
            </CardDescription>
          </CardHeader>
          <Separator className="my-4" />
          <CardContent className="mx-auto w-full space-y-6">
            <Field>
              <FieldLabel>
                Target Enrollment Year{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="targetYear"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {targetYearOptions.map((option) => {
                      const isActive = field.value === option;

                      return (
                        <Button
                          key={option}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => field.onChange(option)}
                          className={
                            isActive
                              ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-700 hover:text-white"
                              : ""
                          }
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError errors={[errors.targetYear]} />
            </Field>

            <Field>
              <FieldLabel>Preferred US States (optional)</FieldLabel>
              <FieldDescription>
                Leave blank to consider all states.
              </FieldDescription>
              <Controller
                control={control}
                name="preferredStates"
                render={({ field }) => (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {preferredStateOptions.map((option) => {
                        const values = field.value ?? [];
                        const isActive = values.includes(option);

                        return (
                          <Button
                            key={option}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextValues = isActive
                                ? values.filter((item) => item !== option)
                                : [...values, option];
                              field.onChange(nextValues);
                            }}
                            className={
                              isActive
                                ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-700 hover:text-white"
                                : ""
                            }
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>
                    {(field.value?.length ?? 0) > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {field.value.map((state) => (
                          <Badge key={state} variant="secondary">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              />
              <FieldError errors={[errors.preferredStates]} />
            </Field>

            <Field>
              <FieldLabel>Extracurricular Interests (optional)</FieldLabel>
              <Controller
                control={control}
                name="extracurriculars"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {extracurricularOptions.map((option) => {
                      const values = field.value ?? [];
                      const isActive = values.includes(option);

                      return (
                        <Button
                          key={option}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nextValues = isActive
                              ? values.filter((item) => item !== option)
                              : [...values, option];
                            field.onChange(nextValues);
                          }}
                          className={
                            isActive
                              ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-700 hover:text-white"
                              : ""
                          }
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError errors={[errors.extracurriculars]} />
            </Field>
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </main>
  );
}
