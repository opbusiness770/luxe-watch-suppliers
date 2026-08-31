export type SupplierInventoryMoneyValue =
  | number
  | string;

export type SupplierInventoryItem = {
  supplierId: string;
  watchId: string;

  quantityOnHand: number;

  supplierCostPrice:
    SupplierInventoryMoneyValue;

  requiredSalePrice:
    SupplierInventoryMoneyValue;

  createdAt?: string;
  updatedAt?: string;

  watch: {
    id: string;
    sku: string;

    brand: string;
    model: string;
    name: string;

    imageUrl:
      | string
      | null;
  };
};

export type SupplierInventoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SupplierInventoryResponse = {
  items: SupplierInventoryItem[];

  pagination:
    SupplierInventoryPagination;
};