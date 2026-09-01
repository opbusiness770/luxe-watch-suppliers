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
 * Returns the main Admin dashboard data.
 *
 * Monthly calculations use the calendar month
 * according to Israel time.
 */
export async function getAdminDashboard() {
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
    activeSuppliers,
    activeWatches,
    warehouseInventory,
    monthlySales,
    monthlyRevenue,
    recentSales,
  ] = await Promise.all([
    prisma.supplier.count({
      where: {
        user: {
          isActive:
            true,
        },
      },
    }),

    prisma.watch.count({
      where: {
        isActive:
          true,

        deletedAt:
          null,
      },
    }),

    prisma.warehouseInventory.aggregate({
      where: {
        watch: {
          is: {
            deletedAt:
              null,
          },
        },
      },

      _sum: {
        quantityOnHand:
          true,
      },
    }),

    /*
     * Completed sales inside the current
     * Israeli calendar month.
     */
    prisma.sale.count({
      where: {
        status:
          SaleStatus.COMPLETED,

        soldAt:
          monthlySaleDateFilter,
      },
    }),

    prisma.sale.aggregate({
      where: {
        status:
          SaleStatus.COMPLETED,

        soldAt:
          monthlySaleDateFilter,
      },

      _sum: {
        totalAmount:
          true,
      },
    }),

    /*
     * Historical recent sales are not restricted
     * to the current month.
     */
    prisma.sale.findMany({
      where: {
        status:
          SaleStatus.COMPLETED,
      },

      take:
        5,

      orderBy: {
        soldAt:
          "desc",
      },

      select: {
        id:
          true,

        totalAmount:
          true,

        soldAt:
          true,

        supplier: {
          select: {
            id:
              true,

            contactName:
              true,
          },
        },

        _count: {
          select: {
            items:
              true,
          },
        },
      },
    }),
  ]);

  /*
   * Top suppliers inside the current
   * Israeli calendar month.
   */
  const topSupplierGroups =
    await prisma.sale.groupBy({
      by: [
        "supplierId",
      ],

      where: {
        status:
          SaleStatus.COMPLETED,

        soldAt:
          monthlySaleDateFilter,
      },

      _sum: {
        totalAmount:
          true,
      },

      _count: {
        id:
          true,
      },

      orderBy: {
        _sum: {
          totalAmount:
            "desc",
        },
      },

      take:
        5,
    });

  const supplierIds =
    topSupplierGroups.map(
      (item) =>
        item.supplierId,
    );

  const suppliers =
    supplierIds.length >
    0
      ? await prisma.supplier.findMany({
          where: {
            id: {
              in:
                supplierIds,
            },
          },

          select: {
            id:
              true,

            contactName:
              true,
          },
        })
      : [];

  const supplierById =
    new Map(
      suppliers.map(
        (supplier) => [
          supplier.id,
          supplier,
        ],
      ),
    );

  const topSuppliers =
    topSupplierGroups.map(
      (group) => ({
        supplierId:
          group.supplierId,

        contactName:
          supplierById.get(
            group.supplierId,
          )?.contactName ??
          "ספק לא ידוע",

        salesCount:
          group._count.id,

        revenue:
          group._sum
            .totalAmount ??
          0,
      }),
    );

  return {
    summary: {
      activeSuppliers,
      activeWatches,

      warehouseUnits:
        warehouseInventory
          ._sum
          .quantityOnHand ??
        0,

      monthlySales,

      monthlyRevenue:
        monthlyRevenue
          ._sum
          .totalAmount ??
        0,
    },

    recentSales,

    topSuppliers,
  };
}