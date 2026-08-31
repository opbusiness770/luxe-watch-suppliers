export type AllocationMoneyValue =
  | number
  | string;

export type AllocationListItem = {
  id: string;

  quantity: number;

  supplierCostPrice:
    AllocationMoneyValue;

  requiredSalePrice:
    AllocationMoneyValue;

  notes: string | null;

  createdAt: string;

  supplier: {
    id: string;
    companyName: string;
  };

  watch: {
    id: string;
    sku: string;
    brand: string;
    model: string;
    name: string;
  };
};

export type CreateAllocationInput = {
  supplierId: string;
  watchId: string;

  quantity: number;

  supplierCostPrice: number;
  requiredSalePrice: number;

  notes?: string;
};

export type AllocationsResponse = {
  allocations:
    AllocationListItem[];

  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};