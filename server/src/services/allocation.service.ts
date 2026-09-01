import {
  InventoryTransactionType,
} from "../generated/prisma/client.js";

import {
  prisma,
} from "../lib/prisma.js";

import {
  createWatchImageDeliveryData,
} from "./image-delivery.service.js";

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

/*
 * Adds signed Cloudinary delivery URLs to the
 * watch nested inside an allocation.
 *
 * imagePublicIds are used only on the backend
 * and are removed before the result is returned.
 */
function addAllocationWatchDeliveryUrls<
  T extends {
    watch: {
      imageUrl:
        | string
        | null;

      imageUrls:
        string[];

      imagePublicIds:
        string[];
    };
  },
>(
  allocation: T,
) {
  const {
    imagePublicIds,
    ...watchWithoutPublicIds
  } =
    allocation.watch;

  const imageDeliveryData =
    createWatchImageDeliveryData(
      allocation.watch
        .imageUrl,

      allocation.watch
        .imageUrls,

      imagePublicIds,
    );

  return {
    ...allocation,

    watch: {
      ...watchWithoutPublicIds,

      ...imageDeliveryData,
    },
  };
}

/*
 * Creates a new stock allocation from the
 * central warehouse to a supplier.
 *
 * Important business rules:
 * - Supplier must exist.
 * - Supplier must be active.
 * - Watch must exist.
 * - Watch must not be deleted.
 * - Watch must be active.
 * - Warehouse stock must be sufficient.
 *
 * The operation runs inside a transaction so
 * all inventory and history changes remain
 * synchronized.
 */
export async function createAllocation(
  input: CreateAllocationInput,
) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * Load supplier.
       */
      const supplier =
        await tx.supplier.findUnique({
          where: {
            id:
              input.supplierId,
          },

          select: {
            id:
              true,

            contactName:
              true,

            user: {
              select: {
                isActive:
                  true,
              },
            },
          },
        });

      if (!supplier) {
        return {
          status:
            "SUPPLIER_NOT_FOUND" as const,
        };
      }

      if (
        !supplier.user
          .isActive
      ) {
        return {
          status:
            "SUPPLIER_INACTIVE" as const,
        };
      }

      /*
       * A soft-deleted watch must never be
       * available for a new allocation.
       */
      const watch =
        await tx.watch.findFirst({
          where: {
            id:
              input.watchId,

            deletedAt:
              null,
          },

          select: {
            id:
              true,

            brand:
              true,

            model:
              true,

            name:
              true,

            isActive:
              true,
          },
        });

      if (!watch) {
        return {
          status:
            "WATCH_NOT_FOUND" as const,
        };
      }

      if (
        !watch.isActive
      ) {
        return {
          status:
            "WATCH_INACTIVE" as const,
        };
      }

      /*
       * Atomic warehouse update.
       *
       * This prevents two concurrent allocation
       * requests from reducing warehouse stock
       * below zero.
       */
      const warehouseUpdate =
        await tx.warehouseInventory.updateMany({
          where: {
            watchId:
              input.watchId,

            quantityOnHand: {
              gte:
                input.quantity,
            },
          },

          data: {
            quantityOnHand: {
              decrement:
                input.quantity,
            },
          },
        });

      /*
       * No row was updated when the warehouse
       * did not contain enough stock.
       */
      if (
        warehouseUpdate.count ===
        0
      ) {
        const warehouseInventory =
          await tx.warehouseInventory.findUnique({
            where: {
              watchId:
                input.watchId,
            },

            select: {
              quantityOnHand:
                true,
            },
          });

        return {
          status:
            "INSUFFICIENT_STOCK" as const,

          currentQuantity:
            warehouseInventory
              ?.quantityOnHand ??
            0,
        };
      }

      /*
       * Read the warehouse balance after
       * the atomic decrement.
       */
      const warehouseInventory =
        await tx.warehouseInventory.findUniqueOrThrow(
          {
            where: {
              watchId:
                input.watchId,
            },

            select: {
              quantityOnHand:
                true,
            },
          },
        );

      /*
       * Add the allocated quantity to the
       * supplier inventory.
       *
       * The latest allocation prices become
       * the current supplier inventory prices.
       */
      const supplierInventory =
        await tx.supplierInventory.upsert({
          where: {
            supplierId_watchId: {
              supplierId:
                input.supplierId,

              watchId:
                input.watchId,
            },
          },

          update: {
            quantityOnHand: {
              increment:
                input.quantity,
            },

            supplierCostPrice:
              input.supplierCostPrice,

            requiredSalePrice:
              input.requiredSalePrice,
          },

          create: {
            supplierId:
              input.supplierId,

            watchId:
              input.watchId,

            quantityOnHand:
              input.quantity,

            supplierCostPrice:
              input.supplierCostPrice,

            requiredSalePrice:
              input.requiredSalePrice,
          },

          select: {
            supplierId:
              true,

            watchId:
              true,

            quantityOnHand:
              true,

            supplierCostPrice:
              true,

            requiredSalePrice:
              true,
          },
        });

      /*
       * Historical allocation record.
       *
       * This record remains even if the watch
       * is soft-deleted in the future.
       */
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
              input.notes ??
              null,
          },

          select: {
            id:
              true,

            quantity:
              true,

            supplierCostPrice:
              true,

            requiredSalePrice:
              true,

            notes:
              true,

            createdAt:
              true,

            supplier: {
              select: {
                id:
                  true,

                contactName:
                  true,
              },
            },

            watch: {
              select: {
                id:
                  true,

                brand:
                  true,

                model:
                  true,

                name:
                  true,

                imageUrl:
                  true,

                imageUrls:
                  true,

                /*
                 * Used only to build signed
                 * Cloudinary delivery URLs.
                 */
                imagePublicIds:
                  true,
              },
            },
          },
        });

      /*
       * Record both sides of the stock movement:
       *
       * 1. Warehouse stock decreases.
       * 2. Supplier stock increases.
       */
      await tx.inventoryTransaction.createMany({
        data: [
          {
            supplierId:
              null,

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
              `הקצאת מלאי לספק ${supplier.contactName}`,
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
              input.notes ??
              "קבלת מלאי מהמחסן המרכזי",
          },
        ],
      });

      const allocationWithDeliveryUrls =
        addAllocationWatchDeliveryUrls(
          allocation,
        );

      return {
        status:
          "SUCCESS" as const,

        allocation:
          allocationWithDeliveryUrls,

        inventory: {
          warehouseQuantityOnHand:
            warehouseInventory.quantityOnHand,

          supplierQuantityOnHand:
            supplierInventory.quantityOnHand,
        },
      };
    },
  );
}

/*
 * Returns historical stock allocations.
 *
 * IMPORTANT:
 * Deleted watches are intentionally NOT filtered
 * out here because this is a historical view.
 *
 * If a watch was deleted after an allocation,
 * the old allocation must still remain visible.
 *
 * Signed image delivery URLs are generated even
 * for watches that were later soft-deleted.
 */
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
    (page - 1) *
    limit;

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

  const [
    allocations,
    total,
  ] =
    await Promise.all([
      prisma.stockAllocation.findMany({
        where,

        skip,

        take:
          limit,

        select: {
          id:
            true,

          quantity:
            true,

          supplierCostPrice:
            true,

          requiredSalePrice:
            true,

          notes:
            true,

          createdAt:
            true,

          supplier: {
            select: {
              id:
                true,

              contactName:
                true,
            },
          },

          watch: {
            select: {
              id:
                true,

              brand:
                true,

              model:
                true,

              name:
                true,

              imageUrl:
                true,

              imageUrls:
                true,

              /*
               * Needed only while generating
               * signed authenticated URLs.
               */
              imagePublicIds:
                true,

              deletedAt:
                true,
            },
          },

          createdByUser: {
            select: {
              username:
                true,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      }),

      prisma.stockAllocation.count({
        where,
      }),
    ]);

  /*
   * Preserve the historical allocation data,
   * but replace Cloudinary management information
   * with signed URLs intended for rendering.
   */
  const allocationsWithDeliveryUrls =
    allocations.map(
      (allocation) =>
        addAllocationWatchDeliveryUrls(
          allocation,
        ),
    );

  return {
    allocations:
      allocationsWithDeliveryUrls,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(
          total /
            limit,
        ),
    },
  };
}