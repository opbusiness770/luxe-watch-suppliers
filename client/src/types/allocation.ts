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

    contactName: string;
  };

  watch: {
    id: string;

    brand: string;

    model: string;

    name: string;

    imageUrl: string | null;

    imageUrls: string[];

    /*
     * Signed Cloudinary URLs used
     * for displaying authenticated
     * watch images in the frontend.
     */
    displayImageUrl:
      | string
      | null;

    displayImageUrls:
      string[];

    deletedAt:
      | string
      | null;
  };

  createdByUser: {
    username: string;
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