export type MoneyValue =
  | number
  | string;

export type DashboardSummary = {
  activeSuppliers: number;
  activeWatches: number;
  warehouseUnits: number;
  monthlySales: number;
  monthlyRevenue: MoneyValue;
};

export type RecentSale = {
  id: string;
  totalAmount: MoneyValue;
  soldAt: string;

  supplier: {
    id: string;
    companyName: string;
  };

  _count: {
    items: number;
  };
};

export type TopSupplier = {
  supplierId: string;
  companyName: string;
  salesCount: number;
  revenue: MoneyValue;
};

export type AdminDashboardResponse = {
  summary: DashboardSummary;
  recentSales: RecentSale[];
  topSuppliers: TopSupplier[];
};