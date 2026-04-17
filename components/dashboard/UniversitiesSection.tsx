"use client";

import * as React from "react";
import { ExternalLinkIcon } from "lucide-react";

import { uniSeedData } from "@/db/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

type UniversityRecord = (typeof uniSeedData)[number] & {
  id?: string;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

type AmountRangeFilter =
  | "all"
  | "under-40000"
  | "40000-60000"
  | "60000-80000"
  | "over-80000";

type GpaRangeFilter = "all" | "under-3.2" | "3.2-3.5" | "3.5-3.8" | "3.8-4.0";

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not specified";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatUsd(value: number | null | undefined) {
  if (value == null) return "Not specified";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-border/60 grid grid-cols-[140px_1fr] gap-3 border-b py-2 text-sm last:border-b-0">
      <p className="text-muted-foreground font-medium">{label}</p>
      <div className="text-foreground">{value}</div>
    </div>
  );
}

export function UniversitiesSection() {
  const universities: UniversityRecord[] = uniSeedData;
  const [financialAidFilter, setFinancialAidFilter] = React.useState<
    "all" | "available" | "not-available"
  >("all");
  const [amountRangeFilter, setAmountRangeFilter] =
    React.useState<AmountRangeFilter>("all");
  const [gpaRangeFilter, setGpaRangeFilter] =
    React.useState<GpaRangeFilter>("all");
  const [deadlineOrder, setDeadlineOrder] = React.useState<
    "none" | "closest" | "farthest"
  >("none");

  const filteredUniversities = React.useMemo(() => {
    const amountRangeMap: Record<
      AmountRangeFilter,
      { min?: number; max?: number }
    > = {
      all: {},
      "under-40000": { max: 40000 },
      "40000-60000": { min: 40000, max: 60000 },
      "60000-80000": { min: 60000, max: 80000 },
      "over-80000": { min: 80000 },
    };

    const gpaRangeMap: Record<GpaRangeFilter, { min?: number; max?: number }> =
      {
        all: {},
        "under-3.2": { max: 3.2 },
        "3.2-3.5": { min: 3.2, max: 3.5 },
        "3.5-3.8": { min: 3.5, max: 3.8 },
        "3.8-4.0": { min: 3.8, max: 4.0 },
      };

    const selectedAmountRange = amountRangeMap[amountRangeFilter];
    const selectedGpaRange = gpaRangeMap[gpaRangeFilter];

    const filtered = universities.filter((university) => {
      if (financialAidFilter === "available" && !university.financialAidAvail) {
        return false;
      }

      if (
        financialAidFilter === "not-available" &&
        university.financialAidAvail
      ) {
        return false;
      }

      if (
        typeof selectedAmountRange.min === "number" &&
        university.tuitionUsd < selectedAmountRange.min
      ) {
        return false;
      }

      if (
        typeof selectedAmountRange.max === "number" &&
        university.tuitionUsd > selectedAmountRange.max
      ) {
        return false;
      }

      if (
        typeof selectedGpaRange.min === "number" &&
        university.minGpa < selectedGpaRange.min
      ) {
        return false;
      }

      if (
        typeof selectedGpaRange.max === "number" &&
        university.minGpa > selectedGpaRange.max
      ) {
        return false;
      }

      return true;
    });

    if (deadlineOrder === "none") {
      return filtered;
    }

    const getDeadlineTime = (university: UniversityRecord) => {
      if (!university.applicationDeadline) {
        return null;
      }

      const time = new Date(university.applicationDeadline).getTime();
      return Number.isNaN(time) ? null : time;
    };

    return [...filtered].sort((a, b) => {
      const timeA = getDeadlineTime(a);
      const timeB = getDeadlineTime(b);

      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1;
      if (timeB === null) return -1;

      return deadlineOrder === "closest" ? timeA - timeB : timeB - timeA;
    });
  }, [
    universities,
    financialAidFilter,
    amountRangeFilter,
    gpaRangeFilter,
    deadlineOrder,
  ]);

  const clearFilters = () => {
    setFinancialAidFilter("all");
    setAmountRangeFilter("all");
    setGpaRangeFilter("all");
    setDeadlineOrder("none");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="bg-card border-border/70 rounded-xl border p-4 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Universities
            </h2>
            <p className="text-muted-foreground text-sm">
              Browse universities and open full details for each option.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredUniversities.length} / {universities.length} records
          </Badge>
        </div>

        <div className="bg-primary/5 border-border/60 mb-4 grid gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="financial-aid-filter">Financial Aid</Label>
            <Select
              value={financialAidFilter}
              onValueChange={(value) =>
                setFinancialAidFilter(
                  value as "all" | "available" | "not-available",
                )
              }
            >
              <SelectTrigger id="financial-aid-filter" className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="not-available">Not available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount-range-filter">Amount Range (USD)</Label>
            <Select
              value={amountRangeFilter}
              onValueChange={(value) =>
                setAmountRangeFilter(value as AmountRangeFilter)
              }
            >
              <SelectTrigger id="amount-range-filter" className="w-full">
                <SelectValue placeholder="All amounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All amounts</SelectItem>
                <SelectItem value="under-40000">Up to $40,000</SelectItem>
                <SelectItem value="40000-60000">$40,000 - $60,000</SelectItem>
                <SelectItem value="60000-80000">$60,000 - $80,000</SelectItem>
                <SelectItem value="over-80000">$80,000 and above</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="gpa-range-filter">Min GPA Range</Label>
            <Select
              value={gpaRangeFilter}
              onValueChange={(value) =>
                setGpaRangeFilter(value as GpaRangeFilter)
              }
            >
              <SelectTrigger id="gpa-range-filter" className="w-full">
                <SelectValue placeholder="All GPA ranges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GPA ranges</SelectItem>
                <SelectItem value="under-3.2">Up to 3.2</SelectItem>
                <SelectItem value="3.2-3.5">3.2 - 3.5</SelectItem>
                <SelectItem value="3.5-3.8">3.5 - 3.8</SelectItem>
                <SelectItem value="3.8-4.0">3.8 - 4.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="deadline-order">Expiration Order</Label>
            <Select
              value={deadlineOrder}
              onValueChange={(value) =>
                setDeadlineOrder(value as "none" | "closest" | "farthest")
              }
            >
              <SelectTrigger id="deadline-order" className="w-full">
                <SelectValue placeholder="Default order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default order</SelectItem>
                <SelectItem value="closest">
                  Closest expiration to farthest
                </SelectItem>
                <SelectItem value="farthest">
                  Farthest expiration to closest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={clearFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-primary/12 [&_th]:font-bold">
            <TableRow className="hover:bg-primary/12">
              <TableHead>Name</TableHead>
              <TableHead>Amount (USD)</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Min GPA</TableHead>
              <TableHead>Financial Aid</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUniversities.map((university, index) => (
              <TableRow key={`${university.name}-${index}`}>
                <TableCell className="font-medium">{university.name}</TableCell>
                <TableCell>{formatUsd(university.tuitionUsd)}</TableCell>
                <TableCell>
                  {formatDate(university.applicationDeadline)}
                </TableCell>
                <TableCell>{university.minGpa.toFixed(1)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      university.financialAidAvail ? "secondary" : "destructive"
                    }
                  >
                    {university.financialAidAvail
                      ? "Available"
                      : "Not available"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="border-border/70 hover:bg-primary/80 cursor-pointer"
                      >
                        View details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{university.name}</DialogTitle>
                        <DialogDescription>
                          Complete university details from the current data
                          model.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[60vh] overflow-y-auto pr-1">
                        <DetailRow
                          label="ID"
                          value={university.id ?? "Generated at insert"}
                        />
                        <DetailRow label="State" value={university.state} />
                        <DetailRow
                          label="Acceptance Rate"
                          value={`${university.acceptanceRate}%`}
                        />
                        <DetailRow
                          label="Minimum GPA"
                          value={university.minGpa.toFixed(1)}
                        />
                        <DetailRow
                          label="Tuition (USD)"
                          value={formatUsd(university.tuitionUsd)}
                        />
                        <DetailRow
                          label="Financial Aid"
                          value={
                            university.financialAidAvail
                              ? "Available"
                              : "Not available"
                          }
                        />
                        <DetailRow
                          label="TOEFL Minimum"
                          value={university.toeflMin ?? "Not specified"}
                        />
                        <DetailRow
                          label="IELTS Minimum"
                          value={university.ieltsMin ?? "Not specified"}
                        />
                        <DetailRow
                          label="Application Deadline"
                          value={formatDate(university.applicationDeadline)}
                        />
                        <DetailRow
                          label="Rank Tier"
                          value={university.rankTier ?? "Not specified"}
                        />
                        <DetailRow
                          label="Website"
                          value={
                            university.websiteUrl ? (
                              <a
                                href={university.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary inline-flex items-center gap-1 hover:underline"
                              >
                                {university.websiteUrl}
                                <ExternalLinkIcon className="size-3.5" />
                              </a>
                            ) : (
                              "Not specified"
                            )
                          }
                        />
                        <DetailRow
                          label="Supported Majors"
                          value={
                            <div className="flex flex-wrap gap-1.5">
                              {university.supportedMajors.map((major) => (
                                <Badge key={major} variant="outline">
                                  {major}
                                </Badge>
                              ))}
                            </div>
                          }
                        />
                        <DetailRow
                          label="Description"
                          value={university.descriptionText}
                        />
                      </div>

                      <DialogFooter showCloseButton />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {filteredUniversities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-6 text-center"
                >
                  No universities match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
