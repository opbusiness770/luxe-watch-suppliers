export type SupplierListItem = {
  id: string;

  contactName: string;

  phone: string | null;
  address: string | null;

  createdAt: string;

  user: {
    username: string;
    email: string | null;
    isActive: boolean;
  };

  _count: {
    inventories: number;
    sales: number;
  };
};

export type SupplierDetails = {
  id: string;

  contactName: string;

  phone: string | null;
  address: string | null;
  notes: string | null;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    username: string;
    email: string | null;
    isActive: boolean;
    createdAt: string;
  };

  inventories: Array<{
    quantityOnHand: number;
    supplierCostPrice: string | number;
    requiredSalePrice: string | number;

    watch: {
      id: string;
      brand: string;
      model: string;
      name: string;
      imageUrl: string | null;
      imageUrls: string[];
      isActive: boolean;
    };
  }>;

  _count: {
    sales: number;
    allocations: number;
  };
};

export type CreateSupplierInput = {
  username: string;
  password: string;

  email?: string;

  contactName: string;

  phone?: string;
  address?: string;
  notes?: string;
};

export type UpdateSupplierInput = {
  email?: string | null;

  contactName?: string;

  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};