import {
  SaleStatus,
} from "../generated/prisma/client.js";

import {
  prisma,
} from "../lib/prisma.js";

import {
  createWatchImageDeliveryData,
} from "./image-delivery.service.js";

export type GetAdminSalesOptions = {
  supplierId?: string;
  status?: SaleStatus;
  from?: Date;
  to?: Date;

  page: number;
  limit: number;
};

type AdminSaleItemWithWatchImages = {
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
 * to the watch inside one Admin sale item.
 *
 * imagePublicIds are used only on the backend
 * and are removed before the response is returned.
 */
function addAdminSaleItemWatchDeliveryUrls<
  T extends AdminSaleItemWithWatchImages,
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
 * Adds signed image delivery URLs
 * to every watch inside a sale.
 */
function addAdminSaleWatchDeliveryUrls<
  T extends {
    items:
      AdminSaleItemWithWatchImages[];
  },
>(
  sale: T,
) {
  return {
    ...sale,

    items:
      sale.items.map(
        (item) =>
          addAdminSaleItemWatchDeliveryUrls(
            item,
          ),
      ),
  };
}

/*
 * Returns all sales for the Admin.
 *
 * Optional filters:
 * - Supplier
 * - Sale status
 * - Date range
 *
 * IMPORTANT:
 * Deleted watches are intentionally NOT filtered.
 * This is historical business data and must remain
 * available even if a watch is later removed from
 * the active catalog.
 *
 * Watch images are returned with signed Cloudinary
 * delivery URLs.
 */
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

  const skip =
    (page - 1) *
    limit;

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
                  gte:
                    from,
                }
              : {}),

            ...(to
              ? {
                  lte:
                    to,
                }
              : {}),
          },
        }
      : {}),
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

          supplier: {
            select: {
              id:
                true,

              contactName:
                true,
            },
          },

          items: {
            select: {
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
                   * Required only by the backend
                   * for generating signed delivery
                   * URLs for authenticated assets.
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

        orderBy: {
          soldAt:
            "desc",
        },
      }),

      prisma.sale.count({
        where,
      }),
    ]);

  /*
   * Build signed Cloudinary URLs for every
   * watch before returning the sales.
   */
  const salesWithDeliveryUrls =
    sales.map(
      (sale) =>
        addAdminSaleWatchDeliveryUrls(
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
 * Returns full details for one sale.
 *
 * Historical watches remain available even if
 * they were soft-deleted after the sale occurred.
 *
 * Signed Cloudinary URLs are generated for all
 * watch images before returning the sale.
 */
export async function getAdminSaleById(
  saleId: string,
) {
  const sale =
    await prisma.sale.findUnique({
      where: {
        id:
          saleId,
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

        updatedAt:
          true,

        supplier: {
          select: {
            id:
              true,

            contactName:
              true,

            phone:
              true,

            user: {
              select: {
                username:
                  true,

                email:
                  true,

                isActive:
                  true,
              },
            },
          },
        },

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
                 * Used only internally to generate
                 * authenticated delivery URLs.
                 */
                imagePublicIds:
                  true,

                /*
                 * Allows the Admin UI to show that
                 * the watch was removed from the
                 * current catalog without losing
                 * the historical sale.
                 */
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

  return addAdminSaleWatchDeliveryUrls(
    sale,
  );
}