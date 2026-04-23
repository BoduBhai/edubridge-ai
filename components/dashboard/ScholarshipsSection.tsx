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
import { Label } from "@/components/ui/label";
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
  ScholarshipsApiResponseSchema,
  type ScholarshipRecord,
  type ScholarshipsApiResponse,
} from "@/lib/validations/dashboard-api";
import { formatDate, formatUsd } from "./list-formatters";
import {
  amountRangeMap,
  DetailRow,
  formatIncomeRequirement,
  getDeadlineTime,
  gpaRangeMap,
  selectScholarships,
  type AmountRangeFilter,
  type DeadlineOrder,
  type GpaRangeFilter,
  type RenewableFilter,
} from "./scholarships-section";

export function ScholarshipsSection() {
  const {
    data: scholarships,
    isLoading,
    fetchError,
  } = useValidatedListFetch<ScholarshipsApiResponse, ScholarshipRecord>({
    url: "/api/dashboard/scholarships",
    schema: ScholarshipsApiResponseSchema,
    select: selectScholarships,
    errorMessage: "Unable to load scholarships.",
    cache: "force-cache",
  });

  const [renewableFilter, setRenewableFilter] =
    React.useState<RenewableFilter>("all");
  const [awardTypeFilter, setAwardTypeFilter] = React.useState("all");
  const [amountRangeFilter, setAmountRangeFilter] =
    React.useState<AmountRangeFilter>("all");
  const [gpaRangeFilter, setGpaRangeFilter] =
    React.useState<GpaRangeFilter>("all");
  const [deadlineOrder, setDeadlineOrder] =
    React.useState<DeadlineOrder>("none");

  const awardTypeOptions = React.useMemo(() => {
    return [
      ...new Set(scholarships.map((scholarship) => scholarship.awardType)),
    ]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [scholarships]);

  const filteredScholarships = React.useMemo(() => {
    const selectedAmountRange = amountRangeMap[amountRangeFilter];
    const selectedGpaRange = gpaRangeMap[gpaRangeFilter];

    const filtered = scholarships.filter((scholarship) => {
      if (renewableFilter === "renewable" && !scholarship.renewable) {
        return false;
      }

      if (renewableFilter === "non-renewable" && scholarship.renewable) {
        return false;
      }

      if (
        awardTypeFilter !== "all" &&
        scholarship.awardType !== awardTypeFilter
      ) {
        return false;
      }

      if (
        typeof selectedAmountRange.min === "number" &&
        scholarship.amountUsd < selectedAmountRange.min
      ) {
        return false;
      }

      if (
        typeof selectedAmountRange.max === "number" &&
        scholarship.amountUsd > selectedAmountRange.max
      ) {
        return false;
      }

      if (
        typeof selectedGpaRange.min === "number" &&
        scholarship.gpaMin < selectedGpaRange.min
      ) {
        return false;
      }

      if (
        typeof selectedGpaRange.max === "number" &&
        scholarship.gpaMin > selectedGpaRange.max
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
    scholarships,
    renewableFilter,
    awardTypeFilter,
    amountRangeFilter,
    gpaRangeFilter,
    deadlineOrder,
  ]);

  const clearFilters = () => {
    setRenewableFilter("all");
    setAwardTypeFilter("all");
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
              Scholarships
            </h2>
            <p className="text-muted-foreground text-sm">
              Browse scholarships and open full details for each opportunity.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredScholarships.length} / {scholarships.length} records
          </Badge>
        </div>

        {fetchError && (
          <p className="mb-3 text-sm text-red-600">{fetchError}</p>
        )}

        <div className="bg-primary/5 border-border/60 mb-4 grid gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-1">
            <Label htmlFor="renewable-filter">Renewability</Label>
            <Select
              value={renewableFilter}
              onValueChange={(value) =>
                setRenewableFilter(value as RenewableFilter)
              }
            >
              <SelectTrigger id="renewable-filter" className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="renewable">Renewable</SelectItem>
                <SelectItem value="non-renewable">Non-renewable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="award-type-filter">Award Type</Label>
            <Select value={awardTypeFilter} onValueChange={setAwardTypeFilter}>
              <SelectTrigger id="award-type-filter" className="w-full">
                <SelectValue placeholder="All award types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All award types</SelectItem>
                {awardTypeOptions.map((awardType) => (
                  <SelectItem key={awardType} value={awardType}>
                    {awardType}
                  </SelectItem>
                ))}
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
                <SelectItem value="under-10000">Up to $10,000</SelectItem>
                <SelectItem value="10000-30000">$10,000 - $30,000</SelectItem>
                <SelectItem value="30000-60000">$30,000 - $60,000</SelectItem>
                <SelectItem value="over-60000">$60,000 and above</SelectItem>
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
                <SelectItem value="under-3.0">Up to 3.0</SelectItem>
                <SelectItem value="3.0-3.4">3.0 - 3.4</SelectItem>
                <SelectItem value="3.4-3.7">3.4 - 3.7</SelectItem>
                <SelectItem value="3.7-4.0">3.7 - 4.0</SelectItem>
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
              <TableHead>Award Type</TableHead>
              <TableHead>Renewable</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredScholarships.map((scholarship, index) => (
              <TableRow key={`${scholarship.name}-${index}`}>
                <TableCell className="font-medium">
                  {scholarship.name}
                </TableCell>
                <TableCell>{formatUsd(scholarship.amountUsd)}</TableCell>
                <TableCell>{formatDate(scholarship.deadline)}</TableCell>
                <TableCell>{scholarship.gpaMin.toFixed(1)}</TableCell>
                <TableCell>{scholarship.awardType}</TableCell>
                <TableCell>
                  <Badge
                    variant={scholarship.renewable ? "secondary" : "outline"}
                  >
                    {scholarship.renewable ? "Yes" : "No"}
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
                        <DialogTitle>{scholarship.name}</DialogTitle>
                        <DialogDescription>
                          Complete scholarship details from the current data
                          model.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[60vh] overflow-y-auto pr-1">
                        <DetailRow
                          label="ID"
                          value={scholarship.id ?? "Generated at insert"}
                        />
                        <DetailRow
                          label="Amount (USD)"
                          value={formatUsd(scholarship.amountUsd)}
                        />
                        <DetailRow
                          label="Renewable"
                          value={scholarship.renewable ? "Yes" : "No"}
                        />
                        <DetailRow
                          label="Minimum GPA"
                          value={scholarship.gpaMin.toFixed(1)}
                        />
                        <DetailRow
                          label="Award Type"
                          value={scholarship.awardType}
                        />
                        <DetailRow
                          label="Deadline"
                          value={formatDate(scholarship.deadline)}
                        />
                        <DetailRow
                          label="Income Requirement"
                          value={formatIncomeRequirement(
                            scholarship.incomeRequirement,
                          )}
                        />
                        <DetailRow
                          label="Application URL"
                          value={
                            scholarship.applicationUrl ? (
                              <a
                                href={scholarship.applicationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary inline-flex items-center gap-1 hover:underline"
                              >
                                {scholarship.applicationUrl}
                                <ExternalLinkIcon className="size-3.5" />
                              </a>
                            ) : (
                              "Not specified"
                            )
                          }
                        />
                        <DetailRow
                          label="Degree Levels"
                          value={
                            <div className="flex flex-wrap gap-1.5">
                              {scholarship.degreeLevels.map((level) => (
                                <Badge key={level} variant="outline">
                                  {level}
                                </Badge>
                              ))}
                            </div>
                          }
                        />
                        <DetailRow
                          label="Eligible Countries"
                          value={
                            <div className="flex flex-wrap gap-1.5">
                              {scholarship.eligibleCountries.map((country) => (
                                <Badge key={country} variant="outline">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          }
                        />
                        <DetailRow
                          label="Eligible Majors"
                          value={
                            <div className="flex flex-wrap gap-1.5">
                              {scholarship.eligibleMajors.map((major) => (
                                <Badge key={major} variant="outline">
                                  {major}
                                </Badge>
                              ))}
                            </div>
                          }
                        />
                        <DetailRow
                          label="Related University ID"
                          value={scholarship.universityId ?? "Not linked"}
                        />
                        <DetailRow
                          label="Description"
                          value={scholarship.descriptionText}
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
                  colSpan={7}
                  className="text-muted-foreground py-6 text-center"
                >
                  <LoadingSpinner label="Loading scholarships..." />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredScholarships.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-6 text-center"
                >
                  No scholarships match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
