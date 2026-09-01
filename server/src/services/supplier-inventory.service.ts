import {
  prisma,
} from "../lib/prisma.js";

import {
  createWatchImageDeliveryData,
} from "./image-delivery.service.js";

export type GetSupplierInventoryOptions = {
  supplierId: string;
  search?: string;
  page: number;
  limit: number;
};

/*
 * Returns the current inventory of a supplier.
 *
 * Business rules:
 * - Only inventory belonging to the logged-in supplier
 *   is returned.
 * - Soft-deleted watches are hidden.
 * - Inactive watches remain visible so the supplier
 *   can still see stock that belongs to them.
 * - Search works by brand, model and watch name.
 *
 * Watch images are returned with signed Cloudinary
 * delivery URLs so authenticated assets can be
 * displayed safely in the frontend.
 */
export async function getSupplierInventory(
  options: GetSupplierInventoryOptions,
) {
  const {
    supplierId,
    search,
    page,
    limit,
  } = options;

  const skip =
    (page - 1) *
    limit;

  const normalizedSearch =
    search?.trim();

  /*
   * A deleted watch should disappear from the
   * supplier's current catalog/inventory.
   *
   * An inactive watch is intentionally NOT filtered
   * here. The supplier can still see that inventory,
   * but sale.service.ts prevents selling it.
   */
  const where = {
    supplierId,

    watch: {
      is: {
        deletedAt:
          null,

        ...(normalizedSearch
          ? {
              OR: [
                {
                  brand: {
                    contains:
                      normalizedSearch,

                    mode:
                      "insensitive" as const,
                  },
                },

                {
                  model: {
                    contains:
                      normalizedSearch,

                    mode:
                      "insensitive" as const,
                  },
                },

                {
                  name: {
                    contains:
                      normalizedSearch,

                    mode:
                      "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      },
    },
  };

  const [
    inventory,
    total,
  ] =
    await Promise.all([
      prisma.supplierInventory.findMany({
        where,

        skip,

        take:
          limit,

        select: {
          quantityOnHand:
            true,

          supplierCostPrice:
            true,

          requiredSalePrice:
            true,

          updatedAt:
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

              description:
                true,

              /*
               * Stored image information.
               *
               * imagePublicIds are required only
               * on the backend in order to generate
               * signed Cloudinary delivery URLs.
               */
              imageUrl:
                true,

              imageUrls:
                true,

              imagePublicIds:
                true,

              isActive:
                true,
            },
          },
        },

        orderBy: {
          updatedAt:
            "desc",
        },
      }),

      prisma.supplierInventory.count({
        where,
      }),
    ]);

  /*
   * Build signed image URLs for every watch.
   *
   * imagePublicIds are deliberately removed from
   * the response because suppliers do not need
   * Cloudinary management identifiers.
   */
  const inventoryWithDeliveryUrls =
    inventory.map(
      (item) => {
        const {
          imagePublicIds,
          ...watchWithoutPublicIds
        } =
          item.watch;

        const imageDeliveryData =
          createWatchImageDeliveryData(
            item.watch
              .imageUrl,

            item.watch
              .imageUrls,

            imagePublicIds,
          );

        return {
          ...item,

          watch: {
            ...watchWithoutPublicIds,

            ...imageDeliveryData,
          },
        };
      },
    );

  return {
    inventory:
      inventoryWithDeliveryUrls,

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