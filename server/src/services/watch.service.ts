import {
  BusinessAuditEventType,
  InventoryTransactionType,
  UserRole,
} from "../generated/prisma/client.js";

import {
  prisma,
} from "../lib/prisma.js";

import {
  createWatchImageDeliveryData,
} from "./image-delivery.service.js";

export type CreateWatchInput = {
  brand: string;
  model: string;
  name: string;

  description?: string | null;

  /*
   * Kept temporarily for backward compatibility.
   */
  imageUrl?: string | null;

  /*
   * Cloudinary image gallery.
   *
   * imageUrls[index] and imagePublicIds[index]
   * always describe the same image.
   */
  imageUrls?: string[];
  imagePublicIds?: string[];

  adminCostPrice: number;
  defaultSupplierPrice: number;
  recommendedSalePrice: number;

  initialQuantity: number;

  createdByUserId: string;
};

export type UpdateWatchInput = {
  brand?: string;
  model?: string;
  name?: string;

  description?: string | null;

  /*
   * Kept temporarily for backward compatibility.
   */
  imageUrl?: string | null;

  imageUrls?: string[];
  imagePublicIds?: string[];

  adminCostPrice?: number;
  defaultSupplierPrice?: number;
  recommendedSalePrice?: number;
};

export type GetWatchesOptions = {
  search?: string;
  brand?: string;
  isActive?: boolean;

  page: number;
  limit: number;
};

type NormalizedImageGallery = {
  imageUrls: string[];
  imagePublicIds: string[];
};

type WatchWithImages = {
  imageUrl:
    | string
    | null;

  imageUrls: string[];

  imagePublicIds: string[];
};

/*
 * Adds signed delivery URLs to a watch
 * without modifying the stored image data.
 *
 * imageUrl / imageUrls:
 * Stored Cloudinary information.
 *
 * displayImageUrl / displayImageUrls:
 * Signed URLs intended for frontend rendering.
 */
function addWatchDeliveryUrls<
  T extends WatchWithImages,
>(
  watch: T,
) {
  return {
    ...watch,

    ...createWatchImageDeliveryData(
      watch.imageUrl,
      watch.imageUrls,
      watch.imagePublicIds,
    ),
  };
}

/*
 * Normalizes the Cloudinary gallery while keeping
 * each URL paired with its public ID.
 *
 * A maximum of 10 images is supported.
 *
 * Legacy images may not have a Cloudinary public ID.
 * In that case an empty string is stored in the
 * matching position so the arrays stay aligned.
 */
function normalizeImageGallery(
  imageUrls?: string[],
  imagePublicIds?: string[],
): NormalizedImageGallery {
  if (!imageUrls) {
    return {
      imageUrls: [],
      imagePublicIds: [],
    };
  }

  const normalizedUrls: string[] =
    [];

  const normalizedPublicIds: string[] =
    [];

  const seenUrls =
    new Set<string>();

  for (
    let index = 0;
    index < imageUrls.length;
    index += 1
  ) {
    const url =
      imageUrls[index]?.trim();

    if (!url) {
      continue;
    }

    if (seenUrls.has(url)) {
      continue;
    }

    const publicId =
      imagePublicIds?.[
        index
      ]?.trim() ?? "";

    normalizedUrls.push(
      url,
    );

    normalizedPublicIds.push(
      publicId,
    );

    seenUrls.add(
      url,
    );

    if (
      normalizedUrls.length >=
      10
    ) {
      break;
    }
  }

  return {
    imageUrls:
      normalizedUrls,

    imagePublicIds:
      normalizedPublicIds,
  };
}

/*
 * Builds the initial image gallery.
 *
 * New records use imageUrls + imagePublicIds.
 * Legacy imageUrl is still accepted temporarily.
 */
function getImageGalleryForCreate(
  input: CreateWatchInput,
): NormalizedImageGallery {
  if (
    input.imageUrls !==
    undefined
  ) {
    return normalizeImageGallery(
      input.imageUrls,
      input.imagePublicIds,
    );
  }

  const legacyImage =
    input.imageUrl?.trim();

  if (!legacyImage) {
    return {
      imageUrls: [],
      imagePublicIds: [],
    };
  }

  return {
    imageUrls: [
      legacyImage,
    ],

    /*
     * Legacy images were not uploaded through
     * Cloudinary, therefore they have no public ID.
     */
    imagePublicIds: [
      "",
    ],
  };
}

export async function getWatches(
  options: GetWatchesOptions,
) {
  const {
    search,
    brand,
    isActive,
    page,
    limit,
  } = options;

  const skip =
    (page - 1) *
    limit;

  /*
   * Deleted watches are never returned
   * in the normal catalog.
   */
  const where = {
    deletedAt: null,

    ...(search
      ? {
          OR: [
            {
              brand: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },

            {
              model: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },

            {
              name: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(brand
      ? {
          brand: {
            equals:
              brand,

            mode:
              "insensitive" as const,
          },
        }
      : {}),

    ...(isActive !==
    undefined
      ? {
          isActive,
        }
      : {}),
  };

  const [
    watches,
    total,
  ] =
    await Promise.all([
      prisma.watch.findMany({
        where,

        skip,

        take:
          limit,

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

          imagePublicIds:
            true,

          adminCostPrice:
            true,

          defaultSupplierPrice:
            true,

          recommendedSalePrice:
            true,

          isActive:
            true,

          createdAt:
            true,

          warehouseInventory:
            {
              select: {
                quantityOnHand:
                  true,
              },
            },
        },

        orderBy: [
          {
            brand:
              "asc",
          },

          {
            model:
              "asc",
          },
        ],
      }),

      prisma.watch.count({
        where,
      }),
    ]);

  const watchesWithDeliveryUrls =
    watches.map(
      (watch) =>
        addWatchDeliveryUrls(
          watch,
        ),
    );

  return {
    watches:
      watchesWithDeliveryUrls,

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
 * Returns a non-deleted watch.
 */
export async function getWatchById(
  watchId: string,
) {
  const watch =
    await prisma.watch.findFirst({
      where: {
        id:
          watchId,

        deletedAt:
          null,
      },

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

        imageUrl:
          true,

        imageUrls:
          true,

        imagePublicIds:
          true,

        adminCostPrice:
          true,

        defaultSupplierPrice:
          true,

        recommendedSalePrice:
          true,

        isActive:
          true,

        createdAt:
          true,

        updatedAt:
          true,

        warehouseInventory:
          {
            select: {
              quantityOnHand:
                true,

              updatedAt:
                true,
            },
          },

        _count: {
          select: {
            supplierInventories:
              true,

            allocations:
              true,

            saleItems:
              true,
          },
        },
      },
    });

  if (!watch) {
    return null;
  }

  return addWatchDeliveryUrls(
    watch,
  );
}

export async function createWatch(
  input: CreateWatchInput,
) {
  const imageGallery =
    getImageGalleryForCreate(
      input,
    );

  const primaryImage =
    imageGallery
      .imageUrls[0] ??
    null;

  return prisma.$transaction(
    async (tx) => {
      const watch =
        await tx.watch.create({
          data: {
            brand:
              input.brand,

            model:
              input.model,

            name:
              input.name,

            description:
              input.description ??
              null,

            /*
             * imageUrl remains synchronized with
             * the first gallery image for backward
             * compatibility.
             */
            imageUrl:
              primaryImage,

            imageUrls:
              imageGallery.imageUrls,

            imagePublicIds:
              imageGallery.imagePublicIds,

            adminCostPrice:
              input.adminCostPrice,

            defaultSupplierPrice:
              input.defaultSupplierPrice,

            recommendedSalePrice:
              input.recommendedSalePrice,

            warehouseInventory:
              {
                create: {
                  quantityOnHand:
                    input.initialQuantity,
                },
              },
          },

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

            imageUrl:
              true,

            imageUrls:
              true,

            imagePublicIds:
              true,

            adminCostPrice:
              true,

            defaultSupplierPrice:
              true,

            recommendedSalePrice:
              true,

            isActive:
              true,

            warehouseInventory:
              {
                select: {
                  quantityOnHand:
                    true,
                },
              },
          },
        });

      if (
        input.initialQuantity >
        0
      ) {
        await tx.inventoryTransaction.create(
          {
            data: {
              watchId:
                watch.id,

              createdByUserId:
                input.createdByUserId,

              type:
                InventoryTransactionType.WAREHOUSE_RECEIPT,

              quantityChange:
                input.initialQuantity,

              balanceAfter:
                input.initialQuantity,

              notes:
                "מלאי התחלתי בעת יצירת השעון",
            },
          },
        );
      }

      return addWatchDeliveryUrls(
        watch,
      );
    },
  );
}

export async function updateWatch(
  watchId: string,
  input: UpdateWatchInput,
) {
  /*
   * Deleted watches cannot be edited through
   * the normal management flow.
   */
  const existingWatch =
    await prisma.watch.findFirst({
      where: {
        id:
          watchId,

        deletedAt:
          null,
      },

      select: {
        id:
          true,
      },
    });

  if (!existingWatch) {
    return null;
  }

  /*
   * Gallery update.
   *
   * imageUrls and imagePublicIds are updated
   * together so their indexes stay synchronized.
   */
  const imageData =
    input.imageUrls !==
    undefined
      ? (() => {
          const gallery =
            normalizeImageGallery(
              input.imageUrls,
              input.imagePublicIds,
            );

          return {
            imageUrls:
              gallery.imageUrls,

            imagePublicIds:
              gallery.imagePublicIds,

            imageUrl:
              gallery
                .imageUrls[0] ??
              null,
          };
        })()
      : input.imageUrl !==
          undefined
        ? (() => {
            const legacyImage =
              input.imageUrl
                ?.trim() ||
              null;

            return {
              imageUrl:
                legacyImage,

              imageUrls:
                legacyImage
                  ? [
                      legacyImage,
                    ]
                  : [],

              imagePublicIds:
                legacyImage
                  ? [
                      "",
                    ]
                  : [],
            };
          })()
        : {};

  const updatedWatch =
    await prisma.watch.update({
      where: {
        id:
          watchId,
      },

      data: {
        brand:
          input.brand,

        model:
          input.model,

        name:
          input.name,

        description:
          input.description,

        ...imageData,

        adminCostPrice:
          input.adminCostPrice,

        defaultSupplierPrice:
          input.defaultSupplierPrice,

        recommendedSalePrice:
          input.recommendedSalePrice,
      },

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

        imageUrl:
          true,

        imageUrls:
          true,

        imagePublicIds:
          true,

        adminCostPrice:
          true,

        defaultSupplierPrice:
          true,

        recommendedSalePrice:
          true,

        isActive:
          true,

        warehouseInventory:
          {
            select: {
              quantityOnHand:
                true,
            },
          },
      },
    });

  return addWatchDeliveryUrls(
    updatedWatch,
  );
}

export async function setWatchStatus(
  watchId: string,
  isActive: boolean,
) {
  const watch =
    await prisma.watch.findFirst({
      where: {
        id:
          watchId,

        deletedAt:
          null,
      },

      select: {
        id:
          true,
      },
    });

  if (!watch) {
    return null;
  }

  return prisma.watch.update({
    where: {
      id:
        watchId,
    },

    data: {
      isActive,
    },

    select: {
      id:
        true,

      isActive:
        true,
    },
  });
}

/*
 * Soft delete a watch.
 *
 * The watch remains in the database so
 * historical business activity stays intact.
 *
 * Images are intentionally NOT removed from
 * Cloudinary here because historical records
 * may still display them.
 */
export async function softDeleteWatch(
  watchId: string,
  deletedByUserId: string,
  deletionReason: string,
) {
  const normalizedReason =
    deletionReason.trim();

  if (!normalizedReason) {
    return {
      status:
        "INVALID_REASON" as const,
    };
  }

  return prisma.$transaction(
    async (tx) => {
      /*
       * Defense in depth.
       */
      const adminUser =
        await tx.user.findFirst({
          where: {
            id:
              deletedByUserId,

            role:
              UserRole.ADMIN,

            isActive:
              true,
          },

          select: {
            id:
              true,
          },
        });

      if (!adminUser) {
        return {
          status:
            "FORBIDDEN" as const,
        };
      }

      const watch =
        await tx.watch.findUnique({
          where: {
            id:
              watchId,
          },

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
        });

      if (!watch) {
        return {
          status:
            "NOT_FOUND" as const,
        };
      }

      if (
        watch.deletedAt
      ) {
        return {
          status:
            "ALREADY_DELETED" as const,

          deletedAt:
            watch.deletedAt,
        };
      }

      const deletedAt =
        new Date();

      await tx.watch.update({
        where: {
          id:
            watchId,
        },

        data: {
          isActive:
            false,

          deletedAt,

          deletedByUserId,

          deletionReason:
            normalizedReason,
        },
      });

      await tx.businessAuditLog.create({
        data: {
          eventType:
            BusinessAuditEventType.WATCH_DELETED,

          watchId,

          createdByUserId:
            deletedByUserId,

          note:
            normalizedReason,
        },
      });

      return {
        status:
          "SUCCESS" as const,

        watch: {
          id:
            watch.id,

          brand:
            watch.brand,

          model:
            watch.model,

          name:
            watch.name,

          deletedAt,

          deletionReason:
            normalizedReason,
        },
      };
    },
  );
}

export async function adjustWarehouseStock(
  watchId: string,
  quantityChange: number,
  createdByUserId: string,
  notes?: string | null,
) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * Deleted watches cannot receive
       * new warehouse adjustments.
       */
      const watch =
        await tx.watch.findFirst({
          where: {
            id:
              watchId,

            deletedAt:
              null,
          },

          select: {
            id:
              true,
          },
        });

      if (!watch) {
        return {
          status:
            "NOT_FOUND" as const,
        };
      }

      const inventory =
        await tx.warehouseInventory.findUnique(
          {
            where: {
              watchId,
            },

            select: {
              quantityOnHand:
                true,
            },
          },
        );

      if (!inventory) {
        return {
          status:
            "NOT_FOUND" as const,
        };
      }

      const newQuantity =
        inventory.quantityOnHand +
        quantityChange;

      if (
        newQuantity <
        0
      ) {
        return {
          status:
            "INSUFFICIENT_STOCK" as const,

          currentQuantity:
            inventory.quantityOnHand,
        };
      }

      await tx.warehouseInventory.update(
        {
          where: {
            watchId,
          },

          data: {
            quantityOnHand:
              newQuantity,
          },
        },
      );

      await tx.inventoryTransaction.create(
        {
          data: {
            watchId,

            createdByUserId,

            type:
              quantityChange >
              0
                ? InventoryTransactionType.WAREHOUSE_RECEIPT
                : InventoryTransactionType.ADJUSTMENT,

            quantityChange,

            balanceAfter:
              newQuantity,

            notes:
              notes ??
              null,
          },
        },
      );

      return {
        status:
          "SUCCESS" as const,

        previousQuantity:
          inventory.quantityOnHand,

        quantityChange,

        quantityOnHand:
          newQuantity,
      };
    },
  );
}