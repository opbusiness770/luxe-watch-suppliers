import { UserRole } from "../generated/prisma/client.js";
import { hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";

export type CreateSupplierInput = {
  username: string;
  email?: string | null;
  password: string;

  companyName: string;
  contactName: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type UpdateSupplierInput = {
  email?: string | null;
  companyName?: string;
  contactName?: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

export async function getSuppliers(
  search?: string,
) {
  const normalizedSearch = search?.trim();

  return prisma.supplier.findMany({
    where: normalizedSearch
      ? {
          OR: [
            {
              companyName: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              contactName: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              user: {
                username: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : undefined,

    select: {
      id: true,
      companyName: true,
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

export async function getSupplierById(
  supplierId: string,
) {
  return prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },

    select: {
      id: true,
      companyName: true,
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
        select: {
          quantityOnHand: true,
          supplierCostPrice: true,
          requiredSalePrice: true,

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

      _count: {
        select: {
          sales: true,
          allocations: true,
        },
      },
    },
  });
}

export async function createSupplier(
  input: CreateSupplierInput,
) {
  const passwordHash = await hashPassword(
    input.password,
  );

  return prisma.user.create({
    data: {
      username: input.username,
      email: input.email ?? null,
      passwordHash,
      role: UserRole.SUPPLIER,

      supplier: {
        create: {
          companyName: input.companyName,
          contactName: input.contactName,
          phone: input.phone ?? null,
          address: input.address ?? null,
          notes: input.notes ?? null,
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
          companyName: true,
          contactName: true,
          phone: true,
          address: true,
        },
      },
    },
  });
}

export async function updateSupplier(
  supplierId: string,
  input: UpdateSupplierInput,
) {
  return prisma.supplier.update({
    where: {
      id: supplierId,
    },

    data: {
      companyName: input.companyName,
      contactName: input.contactName,
      phone: input.phone,
      address: input.address,
      notes: input.notes,

      user:
        input.email !== undefined
          ? {
              update: {
                email: input.email,
              },
            }
          : undefined,
    },

    select: {
      id: true,
      companyName: true,
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
      id: supplier.userId,
    },
    data: {
      isActive,
    },
  });

  return {
    isActive,
  };
}

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
    await hashPassword(password);

  await prisma.user.update({
    where: {
      id: supplier.userId,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true,
  };
}