import { Router } from "express";

import {
  adjustWarehouseStock,
  createWatch,
  getWatchById,
  getWatches,
  setWatchStatus,
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

  const trimmed = value.trim();

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

router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const brand =
      typeof req.query.brand === "string"
        ? req.query.brand.trim()
        : undefined;

    let isActive: boolean | undefined;

    if (req.query.active === "true") {
      isActive = true;
    }

    if (req.query.active === "false") {
      isActive = false;
    }

    const requestedPage =
      Number(req.query.page);

    const requestedLimit =
      Number(req.query.limit);

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 20;

    const result = await getWatches({
      search,
      brand,
      isActive,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת השעונים",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const watch =
      await getWatchById(req.params.id);

    if (!watch) {
      res.status(404).json({
        message: "השעון לא נמצא",
      });
      return;
    }

    res.status(200).json({
      watch,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת השעון",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const authUser = req.authUser;

    if (!authUser) {
      res.status(401).json({
        message: "נדרשת התחברות למערכת",
      });
      return;
    }

    const sku =
      readRequiredString(req.body?.sku);

    const brand =
      readRequiredString(req.body?.brand);

    const model =
      readRequiredString(req.body?.model);

    const name =
      readRequiredString(req.body?.name);

    const adminCostPrice =
      readNumber(
        req.body?.adminCostPrice,
      );

    const defaultSupplierPrice =
      readNumber(
        req.body?.defaultSupplierPrice,
      );

    const recommendedSalePrice =
      readNumber(
        req.body?.recommendedSalePrice,
      );

    const initialQuantity =
      readNumber(
        req.body?.initialQuantity,
      );

    if (
      !sku ||
      !brand ||
      !model ||
      !name
    ) {
      res.status(400).json({
        message:
          "מק״ט, מותג, דגם ושם השעון הם שדות חובה",
      });
      return;
    }

    if (
      adminCostPrice === null ||
      defaultSupplierPrice === null ||
      recommendedSalePrice === null
    ) {
      res.status(400).json({
        message:
          "יש להזין מחירים תקינים",
      });
      return;
    }

    if (
      adminCostPrice < 0 ||
      defaultSupplierPrice < 0 ||
      recommendedSalePrice < 0
    ) {
      res.status(400).json({
        message:
          "מחיר אינו יכול להיות שלילי",
      });
      return;
    }

    if (
      initialQuantity === null ||
      !Number.isInteger(initialQuantity) ||
      initialQuantity < 0
    ) {
      res.status(400).json({
        message:
          "יש להזין כמות מלאי התחלתית תקינה",
      });
      return;
    }

    const watch = await createWatch({
      sku,
      brand,
      model,
      name,

      description:
        readOptionalString(
          req.body?.description,
        ),

      imageUrl:
        readOptionalString(
          req.body?.imageUrl,
        ),

      adminCostPrice,
      defaultSupplierPrice,
      recommendedSalePrice,

      initialQuantity,

      createdByUserId:
        authUser.id,
    });

    res.status(201).json({
      message: "השעון נוסף בהצלחה",
      watch,
    });
  } catch (error) {
    console.error(error);

    res.status(409).json({
      message:
        "לא ניתן להוסיף את השעון. ייתכן שהמק״ט כבר קיים",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data: {
      sku?: string;
      brand?: string;
      model?: string;
      name?: string;

      description?: string | null;
      imageUrl?: string | null;

      adminCostPrice?: number;
      defaultSupplierPrice?: number;
      recommendedSalePrice?: number;
    } = {};

    const stringFields = [
      "sku",
      "brand",
      "model",
      "name",
    ] as const;

    for (const field of stringFields) {
      if (req.body?.[field] !== undefined) {
        const value =
          readRequiredString(
            req.body[field],
          );

        if (!value) {
          res.status(400).json({
            message:
              "שדה טקסט חובה אינו יכול להיות ריק",
          });
          return;
        }

        data[field] = value;
      }
    }

    if (
      req.body?.description !== undefined
    ) {
      data.description =
        readOptionalString(
          req.body.description,
        );
    }

    if (
      req.body?.imageUrl !== undefined
    ) {
      data.imageUrl =
        readOptionalString(
          req.body.imageUrl,
        );
    }

    const priceFields = [
      "adminCostPrice",
      "defaultSupplierPrice",
      "recommendedSalePrice",
    ] as const;

    for (const field of priceFields) {
      if (req.body?.[field] !== undefined) {
        const value =
          readNumber(req.body[field]);

        if (
          value === null ||
          value < 0
        ) {
          res.status(400).json({
            message:
              "יש להזין מחיר תקין שאינו שלילי",
          });
          return;
        }

        data[field] = value;
      }
    }

    const watch = await updateWatch(
      req.params.id,
      data,
    );

    res.status(200).json({
      message:
        "פרטי השעון עודכנו בהצלחה",
      watch,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      message:
        "השעון לא נמצא או שלא ניתן לעדכן אותו",
    });
  }
});

router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      if (
        typeof req.body?.isActive !==
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

      res.status(200).json({
        message: watch.isActive
          ? "השעון הופעל בהצלחה"
          : "השעון הוסתר בהצלחה",

        watch,
      });
    } catch (error) {
      console.error(error);

      res.status(404).json({
        message: "השעון לא נמצא",
      });
    }
  },
);

router.post(
  "/:id/stock",
  async (req, res) => {
    try {
      const authUser = req.authUser;

      if (!authUser) {
        res.status(401).json({
          message:
            "נדרשת התחברות למערכת",
        });
        return;
      }

      const quantityChange =
        readNumber(
          req.body?.quantityChange,
        );

      if (
        quantityChange === null ||
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
        result.status === "NOT_FOUND"
      ) {
        res.status(404).json({
          message: "השעון לא נמצא",
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
      console.error(error);

      res.status(500).json({
        message:
          "אירעה שגיאה בעדכון המלאי",
      });
    }
  },
);

export default router;