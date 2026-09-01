import { Router } from "express";

import {
  UserRole,
} from "../generated/prisma/client.js";

import {
  adjustWarehouseStock,
  createWatch,
  getWatchById,
  getWatches,
  setWatchStatus,
  softDeleteWatch,
  updateWatch,
} from "../services/watch.service.js";

const router = Router();

function readRequiredString(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function readOptionalString(
  value: unknown,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed || null;
}

function readNumber(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

/*
 * Reads the image gallery from the request.
 *
 * The frontend sends imageUrls as an array.
 * Empty values and duplicate URLs are removed.
 * Maximum: 10 images per watch.
 */
function readImageUrls(
  value: unknown,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const imageUrls =
    value
      .filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      )
      .map((url) =>
        url.trim(),
      )
      .filter(Boolean);

  return Array.from(
    new Set(imageUrls),
  ).slice(0, 10);
}

/*
 * Reads Cloudinary public IDs.
 *
 * The order must match imageUrls exactly:
 *
 * imageUrls[index]
 * imagePublicIds[index]
 *
 * Empty public IDs are intentionally preserved
 * for legacy images that were not uploaded
 * through Cloudinary.
 */
function readImagePublicIds(
  value: unknown,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const publicIds =
    value
      .filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      )
      .map(
        (publicId) =>
          publicId.trim(),
      )
      .slice(0, 10);

  return publicIds;
}

/*
 * GET /api/admin/watches
 */
router.get(
  "/",
  async (req, res) => {
    try {
      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search.trim()
          : undefined;

      const brand =
        typeof req.query.brand ===
        "string"
          ? req.query.brand.trim()
          : undefined;

      let isActive:
        | boolean
        | undefined;

      if (
        req.query.active ===
        "true"
      ) {
        isActive = true;
      }

      if (
        req.query.active ===
        "false"
      ) {
        isActive = false;
      }

      const requestedPage =
        Number(
          req.query.page,
        );

      const requestedLimit =
        Number(
          req.query.limit,
        );

      const page =
        Number.isInteger(
          requestedPage,
        ) &&
        requestedPage > 0
          ? requestedPage
          : 1;

      const limit =
        Number.isInteger(
          requestedLimit,
        ) &&
        requestedLimit > 0
          ? Math.min(
              requestedLimit,
              100,
            )
          : 20;

      const result =
        await getWatches({
          search,
          brand,
          isActive,
          page,
          limit,
        });

      res
        .status(200)
        .json(result);
    } catch (error) {
      console.error(
        "Failed to load watches:",
        error,
      );

      res.status(500).json({
        message:
          "אירעה שגיאה בטעינת השעונים",
      });
    }
  },
);

/*
 * GET /api/admin/watches/:id
 */
router.get(
  "/:id",
  async (req, res) => {
    try {
      const watch =
        await getWatchById(
          req.params.id,
        );

      if (!watch) {
        res.status(404).json({
          message:
            "השעון לא נמצא",
        });

        return;
      }

      res.status(200).json({
        watch,
      });
    } catch (error) {
      console.error(
        "Failed to load watch:",
        error,
      );

      res.status(500).json({
        message:
          "אירעה שגיאה בטעינת השעון",
      });
    }
  },
);

/*
 * POST /api/admin/watches
 *
 * Creates a new watch.
 */
router.post(
  "/",
  async (req, res) => {
    try {
      const authUser =
        req.authUser;

      if (!authUser) {
        res.status(401).json({
          message:
            "נדרשת התחברות למערכת",
        });

        return;
      }

      const brand =
        readRequiredString(
          req.body?.brand,
        );

      const model =
        readRequiredString(
          req.body?.model,
        );

      const name =
        readRequiredString(
          req.body?.name,
        );

      const adminCostPrice =
        readNumber(
          req.body
            ?.adminCostPrice,
        );

      const defaultSupplierPrice =
        readNumber(
          req.body
            ?.defaultSupplierPrice,
        );

      const recommendedSalePrice =
        readNumber(
          req.body
            ?.recommendedSalePrice,
        );

      const initialQuantity =
        readNumber(
          req.body
            ?.initialQuantity,
        );

      if (
        !brand ||
        !model ||
        !name
      ) {
        res.status(400).json({
          message:
            "מותג, דגם ושם השעון הם שדות חובה",
        });

        return;
      }

      if (
        adminCostPrice ===
          null ||
        defaultSupplierPrice ===
          null ||
        recommendedSalePrice ===
          null
      ) {
        res.status(400).json({
          message:
            "יש להזין מחירים תקינים",
        });

        return;
      }

      if (
        adminCostPrice < 0 ||
        defaultSupplierPrice <
          0 ||
        recommendedSalePrice <
          0
      ) {
        res.status(400).json({
          message:
            "מחיר אינו יכול להיות שלילי",
        });

        return;
      }

      if (
        initialQuantity ===
          null ||
        !Number.isInteger(
          initialQuantity,
        ) ||
        initialQuantity < 0
      ) {
        res.status(400).json({
          message:
            "יש להזין כמות מלאי התחלתית תקינה",
        });

        return;
      }

      /*
       * imageUrls contains the image URLs.
       *
       * imagePublicIds contains the matching
       * Cloudinary public IDs.
       *
       * imageUrl remains temporarily supported
       * for backward compatibility.
       */
      const imageUrls =
        readImageUrls(
          req.body?.imageUrls,
        );

      const imagePublicIds =
        readImagePublicIds(
          req.body
            ?.imagePublicIds,
        );

      if (
        req.body?.imageUrls !==
          undefined &&
        !Array.isArray(
          req.body.imageUrls,
        )
      ) {
        res.status(400).json({
          message:
            "רשימת התמונות אינה תקינה",
        });

        return;
      }

      if (
        req.body
          ?.imagePublicIds !==
          undefined &&
        !Array.isArray(
          req.body
            .imagePublicIds,
        )
      ) {
        res.status(400).json({
          message:
            "רשימת מזהי התמונות אינה תקינה",
        });

        return;
      }

      /*
       * When both arrays are supplied,
       * they must remain synchronized.
       */
      if (
        imageUrls !==
          undefined &&
        imagePublicIds !==
          undefined &&
        imageUrls.length !==
          imagePublicIds.length
      ) {
        res.status(400).json({
          message:
            "נתוני התמונות אינם תואמים",
        });

        return;
      }

      const watch =
        await createWatch({
          brand,
          model,
          name,

          description:
            readOptionalString(
              req.body
                ?.description,
            ),

          imageUrl:
            readOptionalString(
              req.body
                ?.imageUrl,
            ),

          imageUrls,

          imagePublicIds,

          adminCostPrice,

          defaultSupplierPrice,

          recommendedSalePrice,

          initialQuantity,

          createdByUserId:
            authUser.id,
        });

      res.status(201).json({
        message:
          "השעון נוסף בהצלחה",

        watch,
      });
    } catch (error) {
      console.error(
        "Failed to create watch:",
        error,
      );

      res.status(500).json({
        message:
          "לא ניתן להוסיף את השעון",
      });
    }
  },
);

/*
 * PATCH /api/admin/watches/:id
 *
 * Updates watch details.
 */
router.patch(
  "/:id",
  async (req, res) => {
    try {
      const data: {
        brand?: string;

        model?: string;

        name?: string;

        description?:
          | string
          | null;

        imageUrl?:
          | string
          | null;

        imageUrls?: string[];

        imagePublicIds?: string[];

        adminCostPrice?: number;

        defaultSupplierPrice?: number;

        recommendedSalePrice?: number;
      } = {};

      const stringFields = [
        "brand",
        "model",
        "name",
      ] as const;

      for (
        const field of
        stringFields
      ) {
        if (
          req.body?.[
            field
          ] !== undefined
        ) {
          const value =
            readRequiredString(
              req.body[field],
            );

          if (!value) {
            res
              .status(400)
              .json({
                message:
                  "שדה טקסט חובה אינו יכול להיות ריק",
              });

            return;
          }

          data[field] =
            value;
        }
      }

      if (
        req.body
          ?.description !==
        undefined
      ) {
        data.description =
          readOptionalString(
            req.body
              .description,
          );
      }

      if (
        req.body?.imageUrl !==
        undefined
      ) {
        data.imageUrl =
          readOptionalString(
            req.body.imageUrl,
          );
      }

      /*
       * Update the gallery URLs.
       */
      if (
        req.body
          ?.imageUrls !==
        undefined
      ) {
        if (
          !Array.isArray(
            req.body
              .imageUrls,
          )
        ) {
          res
            .status(400)
            .json({
              message:
                "רשימת התמונות אינה תקינה",
            });

          return;
        }

        data.imageUrls =
          readImageUrls(
            req.body
              .imageUrls,
          ) ?? [];
      }

      /*
       * Update the corresponding Cloudinary
       * public IDs.
       *
       * Public IDs cannot be updated independently
       * from the image gallery.
       */
      if (
        req.body
          ?.imagePublicIds !==
        undefined
      ) {
        if (
          !Array.isArray(
            req.body
              .imagePublicIds,
          )
        ) {
          res
            .status(400)
            .json({
              message:
                "רשימת מזהי התמונות אינה תקינה",
            });

          return;
        }

        if (
          req.body
            ?.imageUrls ===
          undefined
        ) {
          res
            .status(400)
            .json({
              message:
                "לא ניתן לעדכן מזהי תמונות ללא רשימת תמונות",
            });

          return;
        }

        data.imagePublicIds =
          readImagePublicIds(
            req.body
              .imagePublicIds,
          ) ?? [];
      }

      /*
       * The two arrays describe the same images,
       * therefore their indexes must match.
       */
      if (
        data.imageUrls !==
          undefined &&
        data.imagePublicIds !==
          undefined &&
        data.imageUrls.length !==
          data.imagePublicIds.length
      ) {
        res
          .status(400)
          .json({
            message:
              "נתוני התמונות אינם תואמים",
          });

        return;
      }

      const priceFields = [
        "adminCostPrice",
        "defaultSupplierPrice",
        "recommendedSalePrice",
      ] as const;

      for (
        const field of
        priceFields
      ) {
        if (
          req.body?.[
            field
          ] !== undefined
        ) {
          const value =
            readNumber(
              req.body[field],
            );

          if (
            value === null ||
            value < 0
          ) {
            res
              .status(400)
              .json({
                message:
                  "יש להזין מחיר תקין שאינו שלילי",
              });

            return;
          }

          data[field] =
            value;
        }
      }

      const watch =
        await updateWatch(
          req.params.id,
          data,
        );

      if (!watch) {
        res.status(404).json({
          message:
            "השעון לא נמצא",
        });

        return;
      }

      res.status(200).json({
        message:
          "פרטי השעון עודכנו בהצלחה",

        watch,
      });
    } catch (error) {
      console.error(
        "Failed to update watch:",
        error,
      );

      res.status(500).json({
        message:
          "לא ניתן לעדכן את פרטי השעון",
      });
    }
  },
);

/*
 * PATCH /api/admin/watches/:id/status
 *
 * Temporarily enables or disables a watch.
 * This is different from deleting a watch.
 */
router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      if (
        typeof req.body
          ?.isActive !==
        "boolean"
      ) {
        res.status(400).json({
          message:
            "יש להעביר מצב תקין עבור השעון",
        });

        return;
      }

      const watch =
        await setWatchStatus(
          req.params.id,
          req.body.isActive,
        );

      if (!watch) {
        res.status(404).json({
          message:
            "השעון לא נמצא",
        });

        return;
      }

      res.status(200).json({
        message:
          watch.isActive
            ? "השעון הופעל בהצלחה"
            : "השעון הוסתר בהצלחה",

        watch,
      });
    } catch (error) {
      console.error(
        "Failed to change watch status:",
        error,
      );

      res.status(500).json({
        message:
          "אירעה שגיאה בעדכון סטטוס השעון",
      });
    }
  },
);

/*
 * POST /api/admin/watches/:id/stock
 *
 * Adjusts warehouse stock.
 */
router.post(
  "/:id/stock",
  async (req, res) => {
    try {
      const authUser =
        req.authUser;

      if (!authUser) {
        res.status(401).json({
          message:
            "נדרשת התחברות למערכת",
        });

        return;
      }

      const quantityChange =
        readNumber(
          req.body
            ?.quantityChange,
        );

      if (
        quantityChange ===
          null ||
        !Number.isInteger(
          quantityChange,
        ) ||
        quantityChange === 0
      ) {
        res.status(400).json({
          message:
            "שינוי הכמות חייב להיות מספר שלם השונה מאפס",
        });

        return;
      }

      const result =
        await adjustWarehouseStock(
          req.params.id,
          quantityChange,
          authUser.id,

          readOptionalString(
            req.body?.notes,
          ),
        );

      if (
        result.status ===
        "NOT_FOUND"
      ) {
        res.status(404).json({
          message:
            "השעון לא נמצא",
        });

        return;
      }

      if (
        result.status ===
        "INSUFFICIENT_STOCK"
      ) {
        res.status(400).json({
          message:
            "אין מספיק מלאי לביצוע הפעולה",

          currentQuantity:
            result.currentQuantity,
        });

        return;
      }

      res.status(200).json({
        message:
          "המלאי עודכן בהצלחה",

        inventory: {
          previousQuantity:
            result.previousQuantity,

          quantityChange:
            result.quantityChange,

          quantityOnHand:
            result.quantityOnHand,
        },
      });
    } catch (error) {
      console.error(
        "Failed to adjust warehouse stock:",
        error,
      );

      res.status(500).json({
        message:
          "אירעה שגיאה בעדכון המלאי",
      });
    }
  },
);

/*
 * DELETE /api/admin/watches/:id
 *
 * IMPORTANT:
 * This is a SOFT DELETE.
 *
 * The watch remains in the database so that
 * historical sales, allocations and inventory
 * transactions remain intact.
 *
 * Only ADMIN users may perform this action.
 * A deletion reason is mandatory.
 */
router.delete(
  "/:id",
  async (req, res) => {
    try {
      const authUser =
        req.authUser;

      if (!authUser) {
        res.status(401).json({
          message:
            "נדרשת התחברות למערכת",
        });

        return;
      }

      /*
       * Route-level authorization.
       *
       * The service performs another ADMIN
       * verification for defense in depth.
       */
      if (
        authUser.role !==
        UserRole.ADMIN
      ) {
        res.status(403).json({
          message:
            "רק מנהל המערכת רשאי למחוק שעון",
        });

        return;
      }

      const deletionReason =
        readRequiredString(
          req.body
            ?.deletionReason,
        );

      if (!deletionReason) {
        res.status(400).json({
          message:
            "יש להזין סיבה למחיקת השעון",
        });

        return;
      }

      if (
        deletionReason.length <
        3
      ) {
        res.status(400).json({
          message:
            "סיבת המחיקה קצרה מדי",
        });

        return;
      }

      if (
        deletionReason.length >
        1000
      ) {
        res.status(400).json({
          message:
            "סיבת המחיקה ארוכה מדי",
        });

        return;
      }

      const result =
        await softDeleteWatch(
          req.params.id,
          authUser.id,
          deletionReason,
        );

      if (
        result.status ===
        "INVALID_REASON"
      ) {
        res.status(400).json({
          message:
            "יש להזין סיבה למחיקת השעון",
        });

        return;
      }

      if (
        result.status ===
        "FORBIDDEN"
      ) {
        res.status(403).json({
          message:
            "רק מנהל המערכת רשאי למחוק שעון",
        });

        return;
      }

      if (
        result.status ===
        "NOT_FOUND"
      ) {
        res.status(404).json({
          message:
            "השעון לא נמצא",
        });

        return;
      }

      if (
        result.status ===
        "ALREADY_DELETED"
      ) {
        res.status(409).json({
          message:
            "השעון כבר נמחק בעבר",

          deletedAt:
            result.deletedAt,
        });

        return;
      }

      res.status(200).json({
        message:
          "השעון נמחק מהקטלוג והתיעוד נשמר בהיסטוריה העסקית",

        watch:
          result.watch,
      });
    } catch (error) {
      console.error(
        "Failed to delete watch:",
        error,
      );

      res.status(500).json({
        message:
          "אירעה שגיאה במחיקת השעון",
      });
    }
  },
);

export default router;