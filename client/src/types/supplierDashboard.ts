export type SupplierDashboardMoneyValue =
  | number
  | string;

export type SupplierDashboardSummary = {
  totalModels: number;

  availableModels: number;

  inventoryUnits: number;

  monthlySales: number;

  monthlyRevenue:
    SupplierDashboardMoneyValue;
};

export type SupplierDashboardRecentSaleItem = {
  id: string;

  quantity: number;

  salePrice:
    SupplierDashboardMoneyValue;

  watch: {
    id: string;

    brand: string;
    model: string;
    name: string;

    imageUrl:
      | string
      | null;

    imageUrls: string[];

    deletedAt:
      | string
      | null;
  };
};

export type SupplierDashboardRecentSale = {
  id: string;

  status:
    | "COMPLETED"
    | "CANCELLED";

  totalAmount:
    SupplierDashboardMoneyValue;

  soldAt: string;

  items:
    SupplierDashboardRecentSaleItem[];
};

export type SupplierDashboardResponse = {
  summary:
    SupplierDashboardSummary;

  recentSales:
    SupplierDashboardRecentSale[];
};