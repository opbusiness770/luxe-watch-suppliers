import {
  apiFetch,
} from "./http";

import type {
  AdminSaleResponse,
  AdminSalesResponse,
  SaleStatus,
} from "../types/adminSale";

export type GetAdminSalesParams = {
  page?: number;
  limit?: number;

  supplierId?: string;

  status?:
    | SaleStatus
    | "";

  from?: string;
  to?: string;
};

export function getAdminSales(
  params: GetAdminSalesParams,
  signal?: AbortSignal,
): Promise<AdminSalesResponse> {
  const query =
    new URLSearchParams();

  query.set(
    "page",
    String(params.page ?? 1),
  );

  query.set(
    "limit",
    String(params.limit ?? 20),
  );

  if (params.supplierId) {
    query.set(
      "supplierId",
      params.supplierId,
    );
  }

  if (params.status) {
    query.set(
      "status",
      params.status,
    );
  }

  if (params.from) {
    query.set(
      "from",
      params.from,
    );
  }

  if (params.to) {
    query.set(
      "to",
      params.to,
    );
  }

  return apiFetch<AdminSalesResponse>(
    `/api/admin/sales?${query.toString()}`,
    {
      signal,
    },
  );
}

export function getAdminSaleById(
  saleId: string,
): Promise<AdminSaleResponse> {
  return apiFetch<AdminSaleResponse>(
    `/api/admin/sales/${saleId}`,
  );
}