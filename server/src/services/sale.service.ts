import {
  InventoryTransactionType,
} from "../generated/prisma/client.js";

import {
  prisma,
} from "../lib/prisma.js";

import {
  createWatchImageDeliveryData,
} from "./image-delivery.service.js";

export type CreateSaleItemInput = {
  watchId: string;
  quantity: number;
  salePrice: number;
};

export type CreateSaleInput = {
  supplierId: string;
  items: CreateSaleItemInput[];
  notes?: string | null;
};

export type GetSupplierSalesOptions = {
  supplierId: string;
  page: number;
  limit: number;
};

type SaleErrorCode =
  | "WATCH_NOT_IN_INVENTORY"
  | "INSUFFICIENT_STOCK"
  | "PRICE_TOO_LOW"
  | "DUPLICATE_WATCH";

class SaleBusinessError extends Error {
  constructor(
    public readonly code: SaleErrorCode,
    public readonly details?: {
      watchId?: string;
      currentQuantity?: number;
      requiredSalePrice?: number;
    },
  ) {
    super(code);
  }
}

type SaleItemWithWatchImages = {
  watch: {
    imageUrl:
      | string
      | null;

    imageUrls:
      string[];

    imagePublicIds:
      string[];
  };
};

/*
 * Adds signed Cloudinary delivery URLs
 * to one sale item.
 *
 * imagePublicIds are used only by the backend
 * and are removed before returning the item
 * to the frontend.
 */
function addSaleItemWatchDeliveryUrls<
  T extends SaleItemWithWatchImages,
>(
  item: T,
) {
  const {
    imagePublicIds,
    ...watchWithoutPublicIds
  } =
    item.watch;

  const imageDeliveryData =
    createWatchImageDeliveryData(
      item.watch.imageUrl,
      item.watch.imageUrls,
      imagePublicIds,
    );

  return {
    ...item,

    watch: {
      ...watchWithoutPublicIds,

      ...imageDeliveryData,
    },
  };
}

/*
 * Adds signed image delivery URLs to
 * every watch contained in a sale.
 */
function addSaleWatchDeliveryUrls<
  T extends {
    items:
      SaleItemWithWatchImages[];
  },
>(
  sale: T,
) {
  return {
    ...sale,

    items:
      sale.items.map(
        (item) =>
          addSaleItemWatchDeliveryUrls(
            item,
          ),
      ),
  };
}

/*
 * Converts a price to cents before comparison.
 *
 * This avoids floating-point comparison problems
 * such as 0.1 + 0.2 !== 0.3.
 */
function toCents(
  value: number,
): number {
  return Math.round(
    value * 100,
  );
}

/*
 * Creates a supplier sale.
 *
 * Important business rules:
 * - The same watch cannot appear twice in one sale.
 * - The supplier must own the watch in inventory.
 * - Deleted watches cannot be sold.
 * - Inactive watches cannot be sold.
 * - Sale price cannot be lower than the required price.
 * - Supplier stock cannot become negative.
 *
 * The entire operation runs inside one database
 * transaction so inventory and sales stay synchronized.
 */
export async function createSale(
  input: CreateSaleInput,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const watchIds =
          input.items.map(
            (item) =>
              item.watchId,
          );

        const uniqueWatchIds =
          new Set(
            watchIds,
          );

        /*
         * Prevent the same watch from appearing
         * more than once inside a single sale.
         */
        if (
          uniqueWatchIds.size !==
          watchIds.length
        ) {
          throw new SaleBusinessError(
            "DUPLICATE_WATCH",
          );
        }

        /*
         * Load only current, available watches.
         *
         * A watch that was soft-deleted or disabled
         * must not participate in a new sale.
         */
        const inventories =
          await tx.supplierInventory.findMany({
            where: {
              supplierId:
                input.supplierId,

              watchId: {
                in:
                  watchIds,
              },

              watch: {
                deletedAt:
                  null,

                isActive:
                  true,
              },
            },

            select: {
              watchId:
                true,

              supplierCostPrice:
                true,

              requiredSalePrice:
                true,

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
                },
              },
            },
          });

        const inventoryByWatch =
          new Map(
            inventories.map(
              (
                inventory,
              ) => [
                inventory.watchId,
                inventory,
              ],
            ),
          );

        /*
         * Validate each requested sale item
         * before changing any stock.
         */
        const preparedItems =
          input.items.map(
            (item) => {
              const inventory =
                inventoryByWatch.get(
                  item.watchId,
                );

              /*
               * This also covers deleted or inactive
               * watches because they were filtered
               * from the inventory query above.
               */
              if (!inventory) {
                throw new SaleBusinessError(
                  "WATCH_NOT_IN_INVENTORY",
                  {
                    watchId:
                      item.watchId,
                  },
                );
              }

              const requiredSalePrice =
                Number(
                  inventory.requiredSalePrice,
                );

              if (
                toCents(
                  item.salePrice,
                ) <
                toCents(
                  requiredSalePrice,
                )
              ) {
                throw new SaleBusinessError(
                  "PRICE_TOO_LOW",
                  {
                    watchId:
                      item.watchId,

                    requiredSalePrice,
                  },
                );
              }

              return {
                watchId:
                  item.watchId,

                quantity:
                  item.quantity,

                salePrice:
                  item.salePrice,

                supplierCostPrice:
                  Number(
                    inventory.supplierCostPrice,
                  ),

                watch:
                  inventory.watch,
              };
            },
          );

        /*
         * Each stock update is conditional.
         *
         * This prevents overselling when two
         * requests arrive at approximately
         * the same time.
         */
        for (
          const item of
          preparedItems
        ) {
          const result =
            await tx.supplierInventory.updateMany({
              where: {
                supplierId:
                  input.supplierId,

                watchId:
                  item.watchId,

                quantityOnHand: {
                  gte:
                    item.quantity,
                },
              },

              data: {
                quantityOnHand: {
                  decrement:
                    item.quantity,
                },
              },
            });

          if (
            result.count ===
            0
          ) {
            const currentInventory =
              await tx.supplierInventory.findUnique({
                where: {
                  supplierId_watchId:
                    {
                      supplierId:
                        input.supplierId,

                      watchId:
                        item.watchId,
                    },
                },

                select: {
                  quantityOnHand:
                    true,
                },
              });

            throw new SaleBusinessError(
              "INSUFFICIENT_STOCK",
              {
                watchId:
                  item.watchId,

                currentQuantity:
                  currentInventory
                    ?.quantityOnHand ??
                  0,
              },
            );
          }
        }

        /*
         * Read stock balances after all
         * conditional decrements.
         */
        const balances =
          await tx.supplierInventory.findMany({
            where: {
              supplierId:
                input.supplierId,

              watchId: {
                in:
                  watchIds,
              },
            },

            select: {
              watchId:
                true,

              quantityOnHand:
                true,
            },
          });

        const balanceByWatch =
          new Map(
            balances.map(
              (
                inventory,
              ) => [
                inventory.watchId,
                inventory.quantityOnHand,
              ],
            ),
          );

        /*
         * Calculate the sale total in cents.
         */
        const totalCents =
          preparedItems.reduce(
            (
              total,
              item,
            ) =>
              total +
              toCents(
                item.salePrice,
              ) *
                item.quantity,
            0,
          );

        /*
         * Create the sale and snapshot all item
         * prices at the moment of sale.
         */
        const sale =
          await tx.sale.create({
            data: {
              supplierId:
                input.supplierId,

              totalAmount:
                totalCents /
                100,

              notes:
                input.notes ??
                null,

              items: {
                create:
                  preparedItems.map(
                    (
                      item,
                    ) => ({
                      watchId:
                        item.watchId,

                      quantity:
                        item.quantity,

                      salePrice:
                        item.salePrice,

                      supplierCostPrice:
                        item.supplierCostPrice,
                    }),
                  ),
              },
            },

            select: {
              id:
                true,

              status:
                true,

              totalAmount:
                true,

              soldAt:
                true,

              notes:
                true,

              items: {
                select: {
                  id:
                    true,

                  quantity:
                    true,

                  salePrice:
                    true,

                  supplierCostPrice:
                    true,

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
                       * Used only to generate
                       * signed authenticated URLs.
                       */
                      imagePublicIds:
                        true,
                    },
                  },
                },
              },
            },
          });

        /*
         * Write one inventory transaction
         * for every watch included in the sale.
         */
        await tx.inventoryTransaction.createMany({
          data:
            preparedItems.map(
              (
                item,
              ) => ({
                supplierId:
                  input.supplierId,

                watchId:
                  item.watchId,

                type:
                  InventoryTransactionType.SALE,

                quantityChange:
                  -item.quantity,

                balanceAfter:
                  balanceByWatch.get(
                    item.watchId,
                  ) ?? 0,

                referenceId:
                  sale.id,

                notes:
                  "מכירה על ידי הספק",
              }),
            ),
        });

        const saleWithDeliveryUrls =
          addSaleWatchDeliveryUrls(
            sale,
          );

        return {
          status:
            "SUCCESS" as const,

          sale:
            saleWithDeliveryUrls,
        };
      },
    );
  } catch (error) {
    if (
      error instanceof
      SaleBusinessError
    ) {
      return {
        status:
          error.code,

        ...error.details,
      };
    }

    throw error;
  }
}

/*
 * Returns the supplier's historical sales.
 *
 * IMPORTANT:
 * Deleted watches are intentionally NOT filtered
 * from historical sales.
 *
 * A watch may disappear from the active catalog,
 * but an old sale containing that watch must always
 * remain visible.
 *
 * Signed Cloudinary delivery URLs are generated
 * even for watches that were later deleted.
 */
export async function getSupplierSales(
  options: GetSupplierSalesOptions,
) {
  const {
    supplierId,
    page,
    limit,
  } = options;

  const skip =
    (page - 1) *
    limit;

  const where = {
    supplierId,
  };

  const [
    sales,
    total,
  ] =
    await Promise.all([
      prisma.sale.findMany({
        where,

        skip,

        take:
          limit,

        select: {
          id:
            true,

          status:
            true,

          totalAmount:
            true,

          soldAt:
            true,

          notes:
            true,

          items: {
            select: {
              id:
                true,

              quantity:
                true,

              salePrice:
                true,

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
                   * Used only on the backend
                   * for signed delivery URLs.
                   */
                  imagePublicIds:
                    true,

                  /*
                   * Allows the frontend to mark
                   * historical watches that were
                   * removed from the catalog.
                   */
                  deletedAt:
                    true,
                },
              },
            },
          },
        },

        orderBy: {
          soldAt:
            "desc",
        },
      }),

      prisma.sale.count({
        where,
      }),
    ]);

  const salesWithDeliveryUrls =
    sales.map(
      (sale) =>
        addSaleWatchDeliveryUrls(
          sale,
        ),
    );

  return {
    sales:
      salesWithDeliveryUrls,

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

/*
 * Returns one historical sale belonging
 * to a specific supplier.
 *
 * No deletedAt filter is used here.
 * Historical data must remain accessible.
 */
export async function getSupplierSaleById(
  supplierId: string,
  saleId: string,
) {
  const sale =
    await prisma.sale.findFirst({
      where: {
        id:
          saleId,

        supplierId,
      },

      select: {
        id:
          true,

        status:
          true,

        totalAmount:
          true,

        soldAt:
          true,

        notes:
          true,

        createdAt:
          true,

        items: {
          select: {
            id:
              true,

            quantity:
              true,

            salePrice:
              true,

            supplierCostPrice:
              true,

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
                 * Used only to generate
                 * authenticated delivery URLs.
                 */
                imagePublicIds:
                  true,

                deletedAt:
                  true,
              },
            },
          },
        },
      },
    });

  if (!sale) {
    return null;
  }

  return addSaleWatchDeliveryUrls(
    sale,
  );
}