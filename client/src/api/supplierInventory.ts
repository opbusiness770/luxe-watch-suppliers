import {
  apiFetch,
} from "./http";

import type {
  SupplierInventoryItem,
  SupplierInventoryPagination,
  SupplierInventoryResponse,
} from "../types/supplierInventory";

type RawSupplierInventoryResponse = {
  inventory?:
    SupplierInventoryItem[];

  inventories?:
    SupplierInventoryItem[];

  items?:
    SupplierInventoryItem[];

  pagination?:
    SupplierInventoryPagination;
};

export async function getSupplierInventory(
  search = "",
  signal?: AbortSignal,
): Promise<SupplierInventoryResponse> {
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
    "page",
    "1",
  );

  params.set(
    "limit",
    "100",
  );

  const response =
    await apiFetch<RawSupplierInventoryResponse>(
      `/api/supplier/inventory?${params.toString()}`,
      {
        signal,
      },
    );

  const items =
    response.items ??
    response.inventory ??
    response.inventories ??
    [];

  return {
    items,

    pagination:
      response.pagination ?? {
        page: 1,
        limit: 100,
        total: items.length,
        totalPages: 1,
      },
  };
}