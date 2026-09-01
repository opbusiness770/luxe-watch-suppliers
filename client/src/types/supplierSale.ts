export type SupplierSaleMoneyValue =
  | number
  | string;

export type SupplierSaleStatus =
  | "COMPLETED"
  | "CANCELLED";

/*
 * Watch information stored inside
 * historical supplier sales.
 *
 * deletedAt lets the frontend indicate that
 * the watch was later removed from the catalog.
 */
export type SupplierSaleWatch = {
  id: string;

  brand: string;
  model: string;
  name: string;

  imageUrl: string | null;
  imageUrls: string[];

  deletedAt: string | null;
};

/*
 * Sale item returned in the supplier
 * sales list.
 *
 * supplierCostPrice is intentionally not
 * included because the list API does not
 * return it.
 */
export type SupplierSaleListItemEntry = {
  id: string;

  quantity: number;

  salePrice:
    SupplierSaleMoneyValue;

  watch:
    SupplierSaleWatch;
};

/*
 * Sale item returned when loading
 * full details of one sale.
 */
export type SupplierSaleDetailsItem = {
  id: string;

  quantity: number;

  salePrice:
    SupplierSaleMoneyValue;

  supplierCostPrice:
    SupplierSaleMoneyValue;

  watch:
    SupplierSaleWatch;
};

/*
 * One sale in the supplier sales history.
 */
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

  items:
    SupplierSaleListItemEntry[];
};

/*
 * Full details for one supplier sale.
 */
export type SupplierSaleDetails = {
  id: string;

  status:
    SupplierSaleStatus;

  totalAmount:
    SupplierSaleMoneyValue;

  soldAt: string;

  notes:
    | string
    | null;

  createdAt: string;

  items:
    SupplierSaleDetailsItem[];
};

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

/*
 * One item sent when the supplier
 * creates a new sale.
 */
export type CreateSupplierSaleItemInput = {
  watchId: string;
  quantity: number;
  salePrice: number;
};

/*
 * Request body for creating a supplier sale.
 */
export type CreateSupplierSaleInput = {
  items:
    CreateSupplierSaleItemInput[];

  notes?: string;
};