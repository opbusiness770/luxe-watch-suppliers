export type SaleMoneyValue =
  | number
  | string;

export type SaleStatus =
  | "COMPLETED"
  | "CANCELLED";

export type AdminSaleItem = {
  id: string;

  quantity: number;

  salePrice:
    SaleMoneyValue;

  supplierCostPrice:
    SaleMoneyValue;

  watch: {
    id: string;
    sku: string;
    brand: string;
    model: string;
    name: string;
  };
};

export type AdminSaleListItem = {
  id: string;

  status: SaleStatus;

  totalAmount:
    SaleMoneyValue;

  soldAt: string;

  notes:
    | string
    | null;

  supplier: {
    id: string;
    companyName: string;
    contactName?: string;

    user?: {
      username: string;
    };
  };

  items: AdminSaleItem[];
};

export type AdminSaleDetails =
  AdminSaleListItem & {
    createdAt?: string;
    updatedAt?: string;

    supplier: {
      id: string;
      companyName: string;
      contactName?: string;

      user?: {
        username: string;
        email?: string | null;
      };
    };
  };

export type AdminSalesResponse = {
  sales: AdminSaleListItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminSaleResponse = {
  sale: AdminSaleDetails;
};