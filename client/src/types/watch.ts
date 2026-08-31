export type PriceValue =
  | number
  | string;

export type WatchListItem = {
  id: string;
  sku: string;

  brand: string;
  model: string;
  name: string;

  description: string | null;
  imageUrl: string | null;

  adminCostPrice: PriceValue;
  defaultSupplierPrice: PriceValue;
  recommendedSalePrice: PriceValue;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  warehouseInventory:
    | {
        quantityOnHand: number;
      }
    | null;
};

export type WatchDetails = {
  id: string;
  sku: string;

  brand: string;
  model: string;
  name: string;

  description: string | null;
  imageUrl: string | null;

  adminCostPrice: PriceValue;
  defaultSupplierPrice: PriceValue;
  recommendedSalePrice: PriceValue;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  warehouseInventory:
    | {
        quantityOnHand: number;
        updatedAt?: string;
      }
    | null;

  _count?: {
    supplierInventories?: number;
    allocations?: number;
    saleItems?: number;
  };
};

export type CreateWatchInput = {
  sku: string;

  brand: string;
  model: string;
  name: string;

  description?: string;
  imageUrl?: string;

  adminCostPrice: number;
  defaultSupplierPrice: number;
  recommendedSalePrice: number;

  initialQuantity: number;
};

export type UpdateWatchInput = {
  brand?: string;
  model?: string;
  name?: string;

  description?: string | null;
  imageUrl?: string | null;

  adminCostPrice?: number;
  defaultSupplierPrice?: number;
  recommendedSalePrice?: number;
};