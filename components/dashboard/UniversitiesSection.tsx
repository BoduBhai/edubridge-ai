"use client";

import * as React from "react";
import { ExternalLinkIcon } from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
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
import { useValidatedListFetch } from "@/hooks/use-validated-list-fetch";
import {
  UniversitiesApiResponseSchema,
  type UniversitiesApiResponse,
  type UniversityRecord,
} from "@/lib/validations/dashboard-api";
import { Label } from "@/components/ui/label";
import { formatDate, formatUsd } from "./list-formatters";
import {
  amountRangeMap,
  DetailRow,
  getDeadlineTime,
  gpaRangeMap,
  selectUniversities,
  type AmountRangeFilter,
  type DeadlineOrder,
  type FinancialAidFilter,
  type GpaRangeFilter,
} from "./universities-section";

export function UniversitiesSection() {
  const {
    data: universities,
    isLoading,
    fetchError,
  } = useValidatedListFetch<UniversitiesApiResponse, UniversityRecord>({
    url: "/api/dashboard/universities",
    schema: UniversitiesApiResponseSchema,
    select: selectUniversities,
    errorMessage: "Unable to load universities.",
    cache: "force-cache",
  });

  const [financialAidFilter, setFinancialAidFilter] =
    React.useState<FinancialAidFilter>("all");
  const [amountRangeFilter, setAmountRangeFilter] =
    React.useState<AmountRangeFilter>("all");
  const [gpaRangeFilter, setGpaRangeFilter] =
    React.useState<GpaRangeFilter>("all");
  const [deadlineOrder, setDeadlineOrder] =
    React.useState<DeadlineOrder>("none");

  const filteredUniversities = React.useMemo(() => {
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

        {fetchError && (
          <p className="mb-3 text-sm text-red-600">{fetchError}</p>
        )}

        <div className="bg-primary/5 border-border/60 mb-4 grid gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="financial-aid-filter">Financial Aid</Label>
            <Select
              value={financialAidFilter}
              onValueChange={(value) =>
                setFinancialAidFilter(value as FinancialAidFilter)
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
                setDeadlineOrder(value as DeadlineOrder)
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
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-6 text-center"
                >
                  <LoadingSpinner label="Loading universities..." />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredUniversities.length === 0 && (
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
