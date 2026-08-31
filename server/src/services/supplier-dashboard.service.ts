import {
  SaleStatus,
} from "../generated/prisma/client.js";

import {
  prisma,
} from "../lib/prisma.js";

function getStartOfCurrentMonth() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1,
      0,
      0,
      0,
      0,
    ),
  );
}

export async function getSupplierDashboard(
  supplierId: string,
) {
  const startOfMonth =
    getStartOfCurrentMonth();

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
        },

        _count: {
          _all: true,
        },

        _sum: {
          quantityOnHand: true,
        },
      }),

      prisma.supplierInventory.count({
        where: {
          supplierId,

          quantityOnHand: {
            gt: 0,
          },
        },
      }),

      prisma.sale.aggregate({
        where: {
          supplierId,

          status:
            SaleStatus.COMPLETED,

          soldAt: {
            gte: startOfMonth,
          },
        },

        _count: {
          _all: true,
        },

        _sum: {
          totalAmount: true,
        },
      }),

      prisma.sale.findMany({
        where: {
          supplierId,

          status:
            SaleStatus.COMPLETED,
        },

        orderBy: {
          soldAt: "desc",
        },

        take: 5,

        select: {
          id: true,

          status: true,

          totalAmount: true,

          soldAt: true,

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
        inventorySummary._count._all,

      availableModels,

      inventoryUnits:
        inventorySummary._sum
          .quantityOnHand ?? 0,

      monthlySales:
        monthlySalesSummary._count
          ._all,

      monthlyRevenue:
        monthlySalesSummary._sum
          .totalAmount ?? 0,
    },

    recentSales,
  };
}