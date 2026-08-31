import {
  InventoryTransactionType,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

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

function toCents(
  value: number,
): number {
  return Math.round(value * 100);
}

export async function createSale(
  input: CreateSaleInput,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const watchIds =
          input.items.map(
            (item) => item.watchId,
          );

        const uniqueWatchIds =
          new Set(watchIds);

        if (
          uniqueWatchIds.size !==
          watchIds.length
        ) {
          throw new SaleBusinessError(
            "DUPLICATE_WATCH",
          );
        }

        const inventories =
          await tx.supplierInventory.findMany({
            where: {
              supplierId:
                input.supplierId,

              watchId: {
                in: watchIds,
              },
            },

            select: {
              watchId: true,

              supplierCostPrice: true,
              requiredSalePrice: true,

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

        const inventoryByWatch =
          new Map(
            inventories.map(
              (inventory) => [
                inventory.watchId,
                inventory,
              ],
            ),
          );

        const preparedItems =
          input.items.map((item) => {
            const inventory =
              inventoryByWatch.get(
                item.watchId,
              );

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
              toCents(item.salePrice) <
              toCents(requiredSalePrice)
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
          });

        /*
         * Each stock update is conditional.
         * This prevents overselling when two
         * requests arrive at the same time.
         */
        for (
          const item of preparedItems
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

          if (result.count === 0) {
            const currentInventory =
              await tx.supplierInventory.findUnique({
                where: {
                  supplierId_watchId: {
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
                    ?.quantityOnHand ?? 0,
              },
            );
          }
        }

        const balances =
          await tx.supplierInventory.findMany({
            where: {
              supplierId:
                input.supplierId,

              watchId: {
                in: watchIds,
              },
            },

            select: {
              watchId: true,
              quantityOnHand: true,
            },
          });

        const balanceByWatch =
          new Map(
            balances.map(
              (inventory) => [
                inventory.watchId,
                inventory.quantityOnHand,
              ],
            ),
          );

        const totalCents =
          preparedItems.reduce(
            (total, item) =>
              total +
              toCents(
                item.salePrice,
              ) *
                item.quantity,
            0,
          );

        const sale =
          await tx.sale.create({
            data: {
              supplierId:
                input.supplierId,

              totalAmount:
                totalCents / 100,

              notes:
                input.notes ?? null,

              items: {
                create:
                  preparedItems.map(
                    (item) => ({
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
              id: true,
              status: true,
              totalAmount: true,
              soldAt: true,
              notes: true,

              items: {
                select: {
                  id: true,
                  quantity: true,
                  salePrice: true,
                  supplierCostPrice:
                    true,

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
              },
            },
          });

        await tx.inventoryTransaction.createMany({
          data:
            preparedItems.map(
              (item) => ({
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

        return {
          status:
            "SUCCESS" as const,

          sale,
        };
      },
    );
  } catch (error) {
    if (
      error instanceof
      SaleBusinessError
    ) {
      return {
        status: error.code,
        ...error.details,
      };
    }

    throw error;
  }
}

export async function getSupplierSales(
  options: GetSupplierSalesOptions,
) {
  const {
    supplierId,
    page,
    limit,
  } = options;

  const skip =
    (page - 1) * limit;

  const where = {
    supplierId,
  };

  const [sales, total] =
    await Promise.all([
      prisma.sale.findMany({
        where,

        skip,
        take: limit,

        select: {
          id: true,
          status: true,
          totalAmount: true,
          soldAt: true,
          notes: true,

          items: {
            select: {
              id: true,
              quantity: true,
              salePrice: true,

              watch: {
                select: {
                  id: true,
                  sku: true,
                  brand: true,
                  model: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },

        orderBy: {
          soldAt: "desc",
        },
      }),

      prisma.sale.count({
        where,
      }),
    ]);

  return {
    sales,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(total / limit),
    },
  };
}

export async function getSupplierSaleById(
  supplierId: string,
  saleId: string,
) {
  return prisma.sale.findFirst({
    where: {
      id: saleId,
      supplierId,
    },

    select: {
      id: true,
      status: true,
      totalAmount: true,
      soldAt: true,
      notes: true,
      createdAt: true,

      items: {
        select: {
          id: true,
          quantity: true,
          salePrice: true,
          supplierCostPrice: true,

          watch: {
            select: {
              id: true,
              sku: true,
              brand: true,
              model: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
}