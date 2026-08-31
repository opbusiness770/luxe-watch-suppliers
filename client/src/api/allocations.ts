import {
  apiFetch,
} from "./http";

import type {
  AllocationsResponse,
  CreateAllocationInput,
} from "../types/allocation";

export function getAllocations(
  signal?: AbortSignal,
): Promise<AllocationsResponse> {
  return apiFetch<AllocationsResponse>(
    "/api/admin/allocations?limit=100",
    {
      signal,
    },
  );
}

export function createAllocation(
  input: CreateAllocationInput,
): Promise<unknown> {
  return apiFetch(
    "/api/admin/allocations",
    {
      method: "POST",

      body: JSON.stringify(
        input,
      ),
    },
  );
}