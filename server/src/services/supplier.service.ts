import {
  UserRole,
} from "../generated/prisma/client.js";

import {
  hashPassword,
} from "../lib/password.js";

import {
  prisma,
} from "../lib/prisma.js";

export type CreateSupplierInput = {
  username: string;
  email?: string | null;
  password: string;

  contactName: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type UpdateSupplierInput = {
  email?: string | null;

  contactName?: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

/*
 * Returns all suppliers.
 *
 * Search is performed by:
 * - Contact name
 * - Username
 * - Email
 */
export async function getSuppliers(
  search?: string,
) {
  const normalizedSearch =
    search?.trim();

  return prisma.supplier.findMany({
    where: normalizedSearch
      ? {
          OR: [
            {
              contactName: {
                contains:
                  normalizedSearch,

                mode:
                  "insensitive",
              },
            },

            {
              user: {
                username: {
                  contains:
                    normalizedSearch,

                  mode:
                    "insensitive",
                },
              },
            },

            {
              user: {
                email: {
                  contains:
                    normalizedSearch,

                  mode:
                    "insensitive",
                },
              },
            },
          ],
        }
      : undefined,

    select: {
      id: true,

      contactName: true,
      phone: true,
      address: true,

      createdAt: true,

      user: {
        select: {
          username: true,
          email: true,
          isActive: true,
        },
      },

      _count: {
        select: {
          inventories: true,
          sales: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
 * Returns one supplier with current inventory.
 *
 * Watches that were soft-deleted are not returned
 * as part of the supplier's current inventory view.
 *
 * Historical sales and allocations remain stored
 * separately and are not deleted.
 */
export async function getSupplierById(
  supplierId: string,
) {
  return prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },

    select: {
      id: true,

      contactName: true,
      phone: true,
      address: true,
      notes: true,

      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
      },

      inventories: {
        where: {
          watch: {
            deletedAt: null,
          },
        },

        select: {
          quantityOnHand: true,

          supplierCostPrice:
            true,

          requiredSalePrice:
            true,

          watch: {
            select: {
              id: true,

              brand: true,
              model: true,
              name: true,

              imageUrl: true,
              imageUrls: true,

              isActive: true,
            },
          },
        },
      },

      _count: {
        select: {
          sales: true,
          allocations: true,
        },
      },
    },
  });
}

/*
 * Creates a supplier user and supplier profile
 * in one nested Prisma operation.
 */
export async function createSupplier(
  input: CreateSupplierInput,
) {
  const passwordHash =
    await hashPassword(
      input.password,
    );

  return prisma.user.create({
    data: {
      username:
        input.username,

      email:
        input.email ?? null,

      passwordHash,

      role:
        UserRole.SUPPLIER,

      supplier: {
        create: {
          contactName:
            input.contactName,

          phone:
            input.phone ?? null,

          address:
            input.address ?? null,

          notes:
            input.notes ?? null,
        },
      },
    },

    select: {
      id: true,

      username: true,
      email: true,
      isActive: true,

      supplier: {
        select: {
          id: true,

          contactName: true,
          phone: true,
          address: true,
        },
      },
    },
  });
}

/*
 * Updates supplier information.
 *
 * Username is intentionally not changed here.
 * Email belongs to User, while the remaining
 * supplier details belong to Supplier.
 */
export async function updateSupplier(
  supplierId: string,
  input: UpdateSupplierInput,
) {
  return prisma.supplier.update({
    where: {
      id: supplierId,
    },

    data: {
      contactName:
        input.contactName,

      phone:
        input.phone,

      address:
        input.address,

      notes:
        input.notes,

      user:
        input.email !==
        undefined
          ? {
              update: {
                email:
                  input.email,
              },
            }
          : undefined,
    },

    select: {
      id: true,

      contactName: true,
      phone: true,
      address: true,
      notes: true,

      user: {
        select: {
          username: true,
          email: true,
          isActive: true,
        },
      },
    },
  });
}

/*
 * Enables or disables a supplier account.
 */
export async function setSupplierStatus(
  supplierId: string,
  isActive: boolean,
) {
  const supplier =
    await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },

      select: {
        userId: true,
      },
    });

  if (!supplier) {
    return null;
  }

  await prisma.user.update({
    where: {
      id:
        supplier.userId,
    },

    data: {
      isActive,
    },
  });

  return {
    isActive,
  };
}

/*
 * Resets the supplier's password.
 */
export async function resetSupplierPassword(
  supplierId: string,
  password: string,
) {
  const supplier =
    await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },

      select: {
        userId: true,
      },
    });

  if (!supplier) {
    return null;
  }

  const passwordHash =
    await hashPassword(
      password,
    );

  await prisma.user.update({
    where: {
      id:
        supplier.userId,
    },

    data: {
      passwordHash,
    },
  });

  return {
    success: true,
  };
}