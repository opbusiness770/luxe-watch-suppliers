export type SupplierSaleMoneyValue =
  | number
  | string;

export type SupplierSaleStatus =
  | "COMPLETED"
  | "CANCELLED";

export type SupplierSaleItem = {
  id: string;

  quantity: number;

  salePrice:
    SupplierSaleMoneyValue;

  supplierCostPrice:
    SupplierSaleMoneyValue;

  watch: {
    id: string;
    sku: string;

    brand: string;
    model: string;
    name: string;

    imageUrl?: string | null;
  };
};

export type SupplierSaleListItem = {
  id: string;

  status:
    SupplierSaleStatus;

  totalAmount:
    SupplierSaleMoneyValue;

  soldAt: string;

  notes:
    | string
    | null;

  createdAt?: string;

  items:
    SupplierSaleItem[];
};

export type SupplierSaleDetails =
  SupplierSaleListItem;

export type SupplierSalesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SupplierSalesResponse = {
  sales:
    SupplierSaleListItem[];

  pagination:
    SupplierSalesPagination;
};

export type SupplierSaleResponse = {
  sale:
    SupplierSaleDetails;
};

export type CreateSupplierSaleItemInput = {
  watchId: string;
  quantity: number;
  salePrice: number;
};

export type CreateSupplierSaleInput = {
  items:
    CreateSupplierSaleItemInput[];

  notes?: string;
};