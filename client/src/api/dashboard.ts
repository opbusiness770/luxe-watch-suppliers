import {
  apiFetch,
} from "./http";

import type {
  AdminDashboardResponse,
} from "../types/dashboard";

export function getAdminDashboard(
  signal?: AbortSignal,
): Promise<AdminDashboardResponse> {
  return apiFetch<AdminDashboardResponse>(
    "/api/admin/dashboard",
    {
      signal,
    },
  );
}