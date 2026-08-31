import {
  apiFetch,
} from "./http";

import type {
  CreateSupplierInput,
  SupplierDetails,
  SupplierListItem,
  UpdateSupplierInput,
} from "../types/supplier";

type SuppliersResponse = {
  suppliers: SupplierListItem[];
};

type SupplierResponse = {
  supplier: SupplierDetails;
};

type MessageResponse = {
  message: string;
};

export function getSuppliers(
  search = "",
  signal?: AbortSignal,
): Promise<SuppliersResponse> {
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

  const query =
    params.toString();

  return apiFetch<SuppliersResponse>(
    `/api/admin/suppliers${
      query ? `?${query}` : ""
    }`,
    {
      signal,
    },
  );
}

export function getSupplierById(
  supplierId: string,
): Promise<SupplierResponse> {
  return apiFetch<SupplierResponse>(
    `/api/admin/suppliers/${supplierId}`,
  );
}

export function createSupplier(
  input: CreateSupplierInput,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    "/api/admin/suppliers",
    {
      method: "POST",

      body: JSON.stringify(input),
    },
  );
}

export function updateSupplier(
  supplierId: string,
  input: UpdateSupplierInput,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    `/api/admin/suppliers/${supplierId}`,
    {
      method: "PATCH",

      body: JSON.stringify(input),
    },
  );
}

export function setSupplierStatus(
  supplierId: string,
  isActive: boolean,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    `/api/admin/suppliers/${supplierId}/status`,
    {
      method: "PATCH",

      body: JSON.stringify({
        isActive,
      }),
    },
  );
}

export function resetSupplierPassword(
  supplierId: string,
  password: string,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    `/api/admin/suppliers/${supplierId}/reset-password`,
    {
      method: "POST",

      body: JSON.stringify({
        password,
      }),
    },
  );
}