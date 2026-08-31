import { prisma } from "../lib/prisma.js";

export type GetSupplierInventoryOptions = {
  supplierId: string;
  search?: string;
  page: number;
  limit: number;
};

export async function getSupplierInventory(
  options: GetSupplierInventoryOptions,
) {
  const {
    supplierId,
    search,
    page,
    limit,
  } = options;

  const skip = (page - 1) * limit;

  const normalizedSearch =
    search?.trim();

  const where = {
    supplierId,

    ...(normalizedSearch
      ? {
          watch: {
            is: {
              OR: [
                {
                  sku: {
                    contains: normalizedSearch,
                    mode: "insensitive" as const,
                  },
                },
                {
                  brand: {
                    contains: normalizedSearch,
                    mode: "insensitive" as const,
                  },
                },
                {
                  model: {
                    contains: normalizedSearch,
                    mode: "insensitive" as const,
                  },
                },
                {
                  name: {
                    contains: normalizedSearch,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          },
        }
      : {}),
  };

  const [inventory, total] =
    await Promise.all([
      prisma.supplierInventory.findMany({
        where,

        skip,
        take: limit,

        select: {
          quantityOnHand: true,
          supplierCostPrice: true,
          requiredSalePrice: true,
          updatedAt: true,

          watch: {
            select: {
              id: true,
              sku: true,
              brand: true,
              model: true,
              name: true,
              description: true,
              imageUrl: true,
              isActive: true,
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      }),

      prisma.supplierInventory.count({
        where,
      }),
    ]);

  return {
    inventory,

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(total / limit),
    },
  };
}