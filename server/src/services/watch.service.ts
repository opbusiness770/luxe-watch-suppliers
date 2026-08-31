import {
  InventoryTransactionType,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

export type CreateWatchInput = {
  sku: string;
  brand: string;
  model: string;
  name: string;

  description?: string | null;
  imageUrl?: string | null;

  adminCostPrice: number;
  defaultSupplierPrice: number;
  recommendedSalePrice: number;

  initialQuantity: number;

  createdByUserId: string;
};

export type UpdateWatchInput = {
  sku?: string;
  brand?: string;
  model?: string;
  name?: string;

  description?: string | null;
  imageUrl?: string | null;

  adminCostPrice?: number;
  defaultSupplierPrice?: number;
  recommendedSalePrice?: number;
};

export type GetWatchesOptions = {
  search?: string;
  brand?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

export async function getWatches(
  options: GetWatchesOptions,
) {
  const {
    search,
    brand,
    isActive,
    page,
    limit,
  } = options;

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          OR: [
            {
              sku: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              brand: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              model: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(brand
      ? {
          brand: {
            equals: brand,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(isActive !== undefined
      ? {
          isActive,
        }
      : {}),
  };

  const [watches, total] = await Promise.all([
    prisma.watch.findMany({
      where,

      skip,
      take: limit,

      select: {
        id: true,
        sku: true,
        brand: true,
        model: true,
        name: true,
        imageUrl: true,

        adminCostPrice: true,
        defaultSupplierPrice: true,
        recommendedSalePrice: true,

        isActive: true,
        createdAt: true,

        warehouseInventory: {
          select: {
            quantityOnHand: true,
          },
        },
      },

      orderBy: [
        {
          brand: "asc",
        },
        {
          model: "asc",
        },
      ],
    }),

    prisma.watch.count({
      where,
    }),
  ]);

  return {
    watches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getWatchById(
  watchId: string,
) {
  return prisma.watch.findUnique({
    where: {
      id: watchId,
    },

    select: {
      id: true,
      sku: true,
      brand: true,
      model: true,
      name: true,

      description: true,
      imageUrl: true,

      adminCostPrice: true,
      defaultSupplierPrice: true,
      recommendedSalePrice: true,

      isActive: true,
      createdAt: true,
      updatedAt: true,

      warehouseInventory: {
        select: {
          quantityOnHand: true,
          updatedAt: true,
        },
      },

      _count: {
        select: {
          supplierInventories: true,
          allocations: true,
          saleItems: true,
        },
      },
    },
  });
}

export async function createWatch(
  input: CreateWatchInput,
) {
  return prisma.$transaction(async (tx) => {
    const watch = await tx.watch.create({
      data: {
        sku: input.sku,
        brand: input.brand,
        model: input.model,
        name: input.name,

        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,

        adminCostPrice: input.adminCostPrice,
        defaultSupplierPrice:
          input.defaultSupplierPrice,

        recommendedSalePrice:
          input.recommendedSalePrice,

        warehouseInventory: {
          create: {
            quantityOnHand:
              input.initialQuantity,
          },
        },
      },

      select: {
        id: true,
        sku: true,
        brand: true,
        model: true,
        name: true,

        adminCostPrice: true,
        defaultSupplierPrice: true,
        recommendedSalePrice: true,

        isActive: true,

        warehouseInventory: {
          select: {
            quantityOnHand: true,
          },
        },
      },
    });

    if (input.initialQuantity > 0) {
      await tx.inventoryTransaction.create({
        data: {
          watchId: watch.id,
          createdByUserId:
            input.createdByUserId,

          type:
            InventoryTransactionType.WAREHOUSE_RECEIPT,

          quantityChange:
            input.initialQuantity,

          balanceAfter:
            input.initialQuantity,

          notes: "מלאי התחלתי בעת יצירת השעון",
        },
      });
    }

    return watch;
  });
}

export async function updateWatch(
  watchId: string,
  input: UpdateWatchInput,
) {
  return prisma.watch.update({
    where: {
      id: watchId,
    },

    data: {
      sku: input.sku,
      brand: input.brand,
      model: input.model,
      name: input.name,

      description: input.description,
      imageUrl: input.imageUrl,

      adminCostPrice:
        input.adminCostPrice,

      defaultSupplierPrice:
        input.defaultSupplierPrice,

      recommendedSalePrice:
        input.recommendedSalePrice,
    },

    select: {
      id: true,
      sku: true,
      brand: true,
      model: true,
      name: true,

      description: true,
      imageUrl: true,

      adminCostPrice: true,
      defaultSupplierPrice: true,
      recommendedSalePrice: true,

      isActive: true,

      warehouseInventory: {
        select: {
          quantityOnHand: true,
        },
      },
    },
  });
}

export async function setWatchStatus(
  watchId: string,
  isActive: boolean,
) {
  return prisma.watch.update({
    where: {
      id: watchId,
    },

    data: {
      isActive,
    },

    select: {
      id: true,
      isActive: true,
    },
  });
}

export async function adjustWarehouseStock(
  watchId: string,
  quantityChange: number,
  createdByUserId: string,
  notes?: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const inventory =
      await tx.warehouseInventory.findUnique({
        where: {
          watchId,
        },

        select: {
          quantityOnHand: true,
        },
      });

    if (!inventory) {
      return {
        status: "NOT_FOUND" as const,
      };
    }

    const newQuantity =
      inventory.quantityOnHand +
      quantityChange;

    if (newQuantity < 0) {
      return {
        status:
          "INSUFFICIENT_STOCK" as const,

        currentQuantity:
          inventory.quantityOnHand,
      };
    }

    await tx.warehouseInventory.update({
      where: {
        watchId,
      },

      data: {
        quantityOnHand: newQuantity,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        watchId,
        createdByUserId,

        type:
          quantityChange > 0
            ? InventoryTransactionType.WAREHOUSE_RECEIPT
            : InventoryTransactionType.ADJUSTMENT,

        quantityChange,
        balanceAfter: newQuantity,

        notes: notes ?? null,
      },
    });

    return {
      status: "SUCCESS" as const,

      previousQuantity:
        inventory.quantityOnHand,

      quantityChange,

      quantityOnHand: newQuantity,
    };
  });
}