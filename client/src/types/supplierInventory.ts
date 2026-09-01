export type SupplierInventoryMoneyValue =
  | number
  | string;

export type SupplierInventoryItem = {
  quantityOnHand: number;

  supplierCostPrice:
    SupplierInventoryMoneyValue;

  requiredSalePrice:
    SupplierInventoryMoneyValue;

  updatedAt: string;

  watch: {
    id: string;

    brand: string;
    model: string;
    name: string;

    description:
      | string
      | null;

    /*
     * Stored image information.
     *
     * These fields remain for backward
     * compatibility and existing data.
     */
    imageUrl:
      | string
      | null;

    imageUrls: string[];

    /*
     * Signed Cloudinary delivery URLs.
     *
     * These are the fields that should be
     * used when rendering watch images in
     * the supplier frontend.
     */
    displayImageUrl:
      | string
      | null;

    displayImageUrls:
      string[];

    isActive: boolean;
  };
};

export type SupplierInventoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SupplierInventoryResponse = {
  items:
    SupplierInventoryItem[];

  pagination:
    SupplierInventoryPagination;
};