import {
  SaleStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

export type GetAdminSalesOptions = {
  supplierId?: string;
  status?: SaleStatus;
  from?: Date;
  to?: Date;

  page: number;
  limit: number;
};

export async function getAdminSales(
  options: GetAdminSalesOptions,
) {
  const {
    supplierId,
    status,
    from,
    to,
    page,
    limit,
  } = options;

  const skip = (page - 1) * limit;

  const where = {
    ...(supplierId
      ? {
          supplierId,
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(from || to
      ? {
          soldAt: {
            ...(from
              ? {
                  gte: from,
                }
              : {}),

            ...(to
              ? {
                  lte: to,
                }
              : {}),
          },
        }
      : {}),
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

          supplier: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
            },
          },

          items: {
            select: {
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

export async function getAdminSaleById(
  saleId: string,
) {
  return prisma.sale.findUnique({
    where: {
      id: saleId,
    },

    select: {
      id: true,
      status: true,
      totalAmount: true,
      soldAt: true,
      notes: true,
      createdAt: true,
      updatedAt: true,

      supplier: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          phone: true,

          user: {
            select: {
              username: true,
              email: true,
              isActive: true,
            },
          },
        },
      },

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