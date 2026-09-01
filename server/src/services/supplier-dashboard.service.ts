import {
  SaleStatus,
} from "../generated/prisma/client.js";

import {
  prisma,
} from "../lib/prisma.js";

import {
  getCurrentIsraelMonthRange,
} from "../utils/israel-time.js";

/*
 * Returns the dashboard data for a supplier.
 *
 * Monthly sales and revenue use the Israeli
 * calendar month.
 */
export async function getSupplierDashboard(
  supplierId: string,
) {
  const {
    startOfMonth,
    startOfNextMonth,
  } =
    getCurrentIsraelMonthRange();

  const monthlySaleDateFilter = {
    gte:
      startOfMonth,

    lt:
      startOfNextMonth,
  };

  const [
    inventorySummary,
    availableModels,
    monthlySalesSummary,
    recentSales,
  ] =
    await Promise.all([
      prisma.supplierInventory.aggregate({
        where: {
          supplierId,

          watch: {
            is: {
              deletedAt:
                null,
            },
          },
        },

        _count: {
          _all:
            true,
        },

        _sum: {
          quantityOnHand:
            true,
        },
      }),

      prisma.supplierInventory.count({
        where: {
          supplierId,

          quantityOnHand: {
            gt:
              0,
          },

          watch: {
            is: {
              deletedAt:
                null,

              isActive:
                true,
            },
          },
        },
      }),

      /*
       * Completed sales during the current
       * calendar month in Israel.
       */
      prisma.sale.aggregate({
        where: {
          supplierId,

          status:
            SaleStatus.COMPLETED,

          soldAt:
            monthlySaleDateFilter,
        },

        _count: {
          _all:
            true,
        },

        _sum: {
          totalAmount:
            true,
        },
      }),

      prisma.sale.findMany({
        where: {
          supplierId,

          status:
            SaleStatus.COMPLETED,
        },

        orderBy: {
          soldAt:
            "desc",
        },

        take:
          5,

        select: {
          id:
            true,

          status:
            true,

          totalAmount:
            true,

          soldAt:
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

                  deletedAt:
                    true,
                },
              },
            },
          },
        },
      }),
    ]);

  return {
    summary: {
      totalModels:
        inventorySummary
          ._count
          ._all,

      availableModels,

      inventoryUnits:
        inventorySummary
          ._sum
          .quantityOnHand ??
        0,

      monthlySales:
        monthlySalesSummary
          ._count
          ._all,

      monthlyRevenue:
        monthlySalesSummary
          ._sum
          .totalAmount ??
        0,
    },

    recentSales,
  };
}