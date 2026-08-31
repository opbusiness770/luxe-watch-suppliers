import {
  apiFetch,
} from "./http";

import type {
  SupplierDashboardResponse,
} from "../types/supplierDashboard";

export function getSupplierDashboard(
  signal?: AbortSignal,
): Promise<SupplierDashboardResponse> {
  return apiFetch<SupplierDashboardResponse>(
    "/api/supplier/dashboard",
    {
      signal,
    },
  );
}