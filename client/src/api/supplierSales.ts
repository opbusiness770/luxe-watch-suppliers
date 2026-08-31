import {
  apiFetch,
} from "./http";

import type {
  CreateSupplierSaleInput,
  SupplierSaleResponse,
  SupplierSalesPagination,
  SupplierSalesResponse,
} from "../types/supplierSale";

type RawSupplierSalesResponse = {
  sales?: SupplierSalesResponse["sales"];

  pagination?:
    SupplierSalesPagination;
};

export async function createSupplierSale(
  input: CreateSupplierSaleInput,
): Promise<unknown> {
  return apiFetch(
    "/api/supplier/sales",
    {
      method: "POST",

      body: JSON.stringify(
        input,
      ),
    },
  );
}

export async function getSupplierSales(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<SupplierSalesResponse> {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(page),
  );

  params.set(
    "limit",
    String(limit),
  );

  const response =
    await apiFetch<RawSupplierSalesResponse>(
      `/api/supplier/sales?${params.toString()}`,
      {
        signal,
      },
    );

  const sales =
    response.sales ?? [];

  return {
    sales,

    pagination:
      response.pagination ?? {
        page,
        limit,
        total:
          sales.length,
        totalPages: 1,
      },
  };
}

export function getSupplierSaleById(
  saleId: string,
): Promise<SupplierSaleResponse> {
  return apiFetch<SupplierSaleResponse>(
    `/api/supplier/sales/${saleId}`,
  );
}