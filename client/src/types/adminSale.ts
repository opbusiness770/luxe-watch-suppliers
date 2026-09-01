export type SaleMoneyValue =
  | number
  | string;

export type SaleStatus =
  | "COMPLETED"
  | "CANCELLED";

/*
 * Watch information returned inside
 * historical sales.
 *
 * deletedAt allows the UI to indicate that
 * the watch was removed from the catalog
 * after the sale took place.
 */
export type AdminSaleWatch = {
  id: string;

  brand: string;
  model: string;
  name: string;

  imageUrl: string | null;
  imageUrls: string[];

  deletedAt: string | null;
};

/*
 * Sale item returned in the Admin sales list.
 */
export type AdminSaleListItemWatch = {
  quantity: number;

  salePrice:
    SaleMoneyValue;

  watch:
    AdminSaleWatch;
};

/*
 * Sale item returned when opening
 * the full sale details.
 */
export type AdminSaleDetailsItem = {
  id: string;

  quantity: number;

  salePrice:
    SaleMoneyValue;

  supplierCostPrice:
    SaleMoneyValue;

  watch:
    AdminSaleWatch;
};

/*
 * One sale in the Admin sales list.
 */
export type AdminSaleListItem = {
  id: string;

  status:
    SaleStatus;

  totalAmount:
    SaleMoneyValue;

  soldAt: string;

  notes:
    | string
    | null;

  supplier: {
    id: string;
    contactName: string;
  };

  items:
    AdminSaleListItemWatch[];
};

/*
 * Full details for one sale.
 */
export type AdminSaleDetails = {
  id: string;

  status:
    SaleStatus;

  totalAmount:
    SaleMoneyValue;

  soldAt: string;

  notes:
    | string
    | null;

  createdAt: string;
  updatedAt: string;

  supplier: {
    id: string;

    contactName:
      string;

    phone:
      | string
      | null;

    user: {
      username: string;

      email:
        | string
        | null;

      isActive:
        boolean;
    };
  };

  items:
    AdminSaleDetailsItem[];
};

export type AdminSalesResponse = {
  sales:
    AdminSaleListItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminSaleResponse = {
  sale:
    AdminSaleDetails;
};