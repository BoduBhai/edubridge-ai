"use client";

import * as React from "react";
import type { z } from "zod";

type UseValidatedListFetchOptions<TResponse, TItem> = {
  url: string;
  schema: z.ZodType<TResponse>;
  select: (response: TResponse) => TItem[];
  errorMessage: string;
  cache?: RequestCache;
};

export function useValidatedListFetch<TResponse, TItem>({
  url,
  schema,
  select,
  errorMessage,
  cache = "no-store",
}: UseValidatedListFetchOptions<TResponse, TItem>) {
  const [data, setData] = React.useState<TItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const abortController = new AbortController();

    async function fetchData() {
      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch(url, {
          method: "GET",
          cache,
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(errorMessage);
        }

        const jsonPayload: unknown = await response.json();
        const parsedPayload = schema.safeParse(jsonPayload);

        if (!parsedPayload.success) {
          throw new Error(errorMessage);
        }

        setData(select(parsedPayload.data));
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setFetchError(error instanceof Error ? error.message : errorMessage);
        setData([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url, schema, select, errorMessage, cache]);

  return {
    data,
    isLoading,
    fetchError,
  };
}
