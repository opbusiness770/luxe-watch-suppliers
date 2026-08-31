import {
  apiFetch,
} from "./http";

import type {
  CreateWatchInput,
  UpdateWatchInput,
  WatchDetails,
  WatchListItem,
} from "../types/watch";

type WatchesResponse = {
  watches: WatchListItem[];

  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type WatchResponse = {
  watch: WatchDetails;
};

export function getWatches(
  search = "",
  signal?: AbortSignal,
): Promise<WatchesResponse> {
  const params =
    new URLSearchParams();

  const normalizedSearch =
    search.trim();

  if (normalizedSearch) {
    params.set(
      "search",
      normalizedSearch,
    );
  }

  params.set(
    "limit",
    "100",
  );

  const query =
    params.toString();

  return apiFetch<WatchesResponse>(
    `/api/admin/watches?${query}`,
    {
      signal,
    },
  );
}

export function getWatchById(
  watchId: string,
): Promise<WatchResponse> {
  return apiFetch<WatchResponse>(
    `/api/admin/watches/${watchId}`,
  );
}

export function createWatch(
  input: CreateWatchInput,
): Promise<unknown> {
  return apiFetch(
    "/api/admin/watches",
    {
      method: "POST",

      body: JSON.stringify(
        input,
      ),
    },
  );
}

export function updateWatch(
  watchId: string,
  input: UpdateWatchInput,
): Promise<unknown> {
  return apiFetch(
    `/api/admin/watches/${watchId}`,
    {
      method: "PATCH",

      body: JSON.stringify(
        input,
      ),
    },
  );
}

export function setWatchStatus(
  watchId: string,
  isActive: boolean,
): Promise<unknown> {
  return apiFetch(
    `/api/admin/watches/${watchId}/status`,
    {
      method: "PATCH",

      body: JSON.stringify({
        isActive,
      }),
    },
  );
}

export function adjustWatchStock(
  watchId: string,
  quantityChange: number,
  notes?: string,
): Promise<unknown> {
  return apiFetch(
    `/api/admin/watches/${watchId}/stock`,
    {
      method: "POST",

      body: JSON.stringify({
        quantityChange,
        notes:
          notes?.trim() ||
          undefined,
      }),
    },
  );
}