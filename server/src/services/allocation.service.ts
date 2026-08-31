import {
  InventoryTransactionType,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

export type CreateAllocationInput = {
  supplierId: string;
  watchId: string;

  quantity: number;

  supplierCostPrice: number;
  requiredSalePrice: number;

  notes?: string | null;

  createdByUserId: string;
};

export type GetAllocationsOptions = {
  supplierId?: string;
  watchId?: string;
  page: number;
  limit: number;
};

export async function createAllocation(
  input: CreateAllocationInput,
) {
  return prisma.$transaction(async (tx) => {
    const supplier =
      await tx.supplier.findUnique({
        where: {
          id: input.supplierId,
        },

        select: {
          id: true,
          companyName: true,

          user: {
            select: {
              isActive: true,
            },
          },
        },
      });

    if (!supplier) {
      return {
        status: "SUPPLIER_NOT_FOUND" as const,
      };
    }

    if (!supplier.user.isActive) {
      return {
        status: "SUPPLIER_INACTIVE" as const,
      };
    }

    const watch =
      await tx.watch.findUnique({
        where: {
          id: input.watchId,
        },

        select: {
          id: true,
          sku: true,
          brand: true,
          model: true,
          name: true,
          isActive: true,
        },
      });

    if (!watch) {
      return {
        status: "WATCH_NOT_FOUND" as const,
      };
    }

    if (!watch.isActive) {
      return {
        status: "WATCH_INACTIVE" as const,
      };
    }

    // Atomic update prevents the warehouse stock
    // from becoming negative under concurrent requests.
    const warehouseUpdate =
      await tx.warehouseInventory.updateMany({
        where: {
          watchId: input.watchId,

          quantityOnHand: {
            gte: input.quantity,
          },
        },

        data: {
          quantityOnHand: {
            decrement: input.quantity,
          },
        },
      });

    if (warehouseUpdate.count === 0) {
      const warehouseInventory =
        await tx.warehouseInventory.findUnique({
          where: {
            watchId: input.watchId,
          },

          select: {
            quantityOnHand: true,
          },
        });

      return {
        status: "INSUFFICIENT_STOCK" as const,

        currentQuantity:
          warehouseInventory?.quantityOnHand ?? 0,
      };
    }

    const warehouseInventory =
      await tx.warehouseInventory.findUniqueOrThrow({
        where: {
          watchId: input.watchId,
        },

        select: {
          quantityOnHand: true,
        },
      });

    const supplierInventory =
      await tx.supplierInventory.upsert({
        where: {
          supplierId_watchId: {
            supplierId: input.supplierId,
            watchId: input.watchId,
          },
        },

        update: {
          quantityOnHand: {
            increment: input.quantity,
          },

          supplierCostPrice:
            input.supplierCostPrice,

          requiredSalePrice:
            input.requiredSalePrice,
        },

        create: {
          supplierId: input.supplierId,
          watchId: input.watchId,

          quantityOnHand:
            input.quantity,

          supplierCostPrice:
            input.supplierCostPrice,

          requiredSalePrice:
            input.requiredSalePrice,
        },

        select: {
          supplierId: true,
          watchId: true,

          quantityOnHand: true,

          supplierCostPrice: true,
          requiredSalePrice: true,
        },
      });

    const allocation =
      await tx.stockAllocation.create({
        data: {
          supplierId:
            input.supplierId,

          watchId:
            input.watchId,

          createdByUserId:
            input.createdByUserId,

          quantity:
            input.quantity,

          supplierCostPrice:
            input.supplierCostPrice,

          requiredSalePrice:
            input.requiredSalePrice,

          notes:
            input.notes ?? null,
        },

        select: {
          id: true,
          quantity: true,

          supplierCostPrice: true,
          requiredSalePrice: true,

          notes: true,
          createdAt: true,

          supplier: {
            select: {
              id: true,
              companyName: true,
            },
          },

          watch: {
            select: {
              id: true,
              sku: true,
              brand: true,
              model: true,
              name: true,
            },
          },
        },
      });

    await tx.inventoryTransaction.createMany({
      data: [
        {
          supplierId: null,

          watchId:
            input.watchId,

          createdByUserId:
            input.createdByUserId,

          type:
            InventoryTransactionType.ALLOCATION,

          quantityChange:
            -input.quantity,

          balanceAfter:
            warehouseInventory.quantityOnHand,

          referenceId:
            allocation.id,

          notes:
            `הקצאת מלאי לספק ${supplier.companyName}`,
        },

        {
          supplierId:
            input.supplierId,

          watchId:
            input.watchId,

          createdByUserId:
            input.createdByUserId,

          type:
            InventoryTransactionType.ALLOCATION,

          quantityChange:
            input.quantity,

          balanceAfter:
            supplierInventory.quantityOnHand,

          referenceId:
            allocation.id,

          notes:
            input.notes ?? "קבלת מלאי מהמחסן המרכזי",
        },
      ],
    });

    return {
      status: "SUCCESS" as const,

      allocation,

      inventory: {
        warehouseQuantityOnHand:
          warehouseInventory.quantityOnHand,

        supplierQuantityOnHand:
          supplierInventory.quantityOnHand,
      },
    };
  });
}
export async function getAllocations(
  options: GetAllocationsOptions,
) {
  const {
    supplierId,
    watchId,
    page,
    limit,
  } = options;

  const skip =
    (page - 1) * limit;

  const where = {
    ...(supplierId
      ? {
          supplierId,
        }
      : {}),

    ...(watchId
      ? {
          watchId,
        }
      : {}),
  };

  const [allocations, total] =
    await Promise.all([
      prisma.stockAllocation.findMany({
        where,

        skip,
        take: limit,

        select: {
          id: true,

          quantity: true,

          supplierCostPrice: true,
          requiredSalePrice: true,

          notes: true,
          createdAt: true,

          supplier: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
            },
          },

          watch: {
            select: {
              id: true,
              sku: true,
              brand: true,
              model: true,
              name: true,
            },
          },

          createdByUser: {
            select: {
              username: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.stockAllocation.count({
        where,
      }),
    ]);

  return {
    allocations,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(total / limit),
    },
  };
}