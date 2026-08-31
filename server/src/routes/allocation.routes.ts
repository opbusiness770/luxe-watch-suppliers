import { Router } from "express";

import {
  createAllocation,
  getAllocations,
} from "../services/allocation.service.js";

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

router.post("/", async (req, res) => {
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

    const supplierId =
      readRequiredString(
        req.body?.supplierId,
      );

    const watchId =
      readRequiredString(
        req.body?.watchId,
      );

    const quantity =
      readNumber(
        req.body?.quantity,
      );

    const supplierCostPrice =
      readNumber(
        req.body?.supplierCostPrice,
      );

    const requiredSalePrice =
      readNumber(
        req.body?.requiredSalePrice,
      );

    if (
      !supplierId ||
      !watchId
    ) {
      res.status(400).json({
        message:
          "יש לבחור ספק ושעון",
      });

      return;
    }

    if (
      quantity === null ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      res.status(400).json({
        message:
          "כמות ההקצאה חייבת להיות מספר שלם וחיובי",
      });

      return;
    }

    if (
      supplierCostPrice === null ||
      requiredSalePrice === null ||
      supplierCostPrice < 0 ||
      requiredSalePrice < 0
    ) {
      res.status(400).json({
        message:
          "יש להזין מחירים תקינים",
      });

      return;
    }

    if (
      requiredSalePrice <
      supplierCostPrice
    ) {
      res.status(400).json({
        message:
          "מחיר המכירה הנדרש אינו יכול להיות נמוך ממחיר העלות לספק",
      });

      return;
    }

    const result =
      await createAllocation({
        supplierId,
        watchId,

        quantity,

        supplierCostPrice,
        requiredSalePrice,

        notes:
          readOptionalString(
            req.body?.notes,
          ),

        createdByUserId:
          authUser.id,
      });

    if (
      result.status ===
      "SUPPLIER_NOT_FOUND"
    ) {
      res.status(404).json({
        message:
          "הספק לא נמצא",
      });

      return;
    }

    if (
      result.status ===
      "SUPPLIER_INACTIVE"
    ) {
      res.status(400).json({
        message:
          "לא ניתן להקצות מלאי לספק שאינו פעיל",
      });

      return;
    }

    if (
      result.status ===
      "WATCH_NOT_FOUND"
    ) {
      res.status(404).json({
        message:
          "השעון לא נמצא",
      });

      return;
    }

    if (
      result.status ===
      "WATCH_INACTIVE"
    ) {
      res.status(400).json({
        message:
          "לא ניתן להקצות שעון שאינו פעיל",
      });

      return;
    }

    if (
      result.status ===
      "INSUFFICIENT_STOCK"
    ) {
      res.status(400).json({
        message:
          "אין מספיק מלאי במחסן המרכזי לביצוע ההקצאה",

        currentQuantity:
          result.currentQuantity,
      });

      return;
    }

    res.status(201).json({
      message:
        "המלאי הוקצה לספק בהצלחה",

      allocation:
        result.allocation,

      inventory:
        result.inventory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בהקצאת המלאי",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const supplierId =
      typeof req.query.supplierId === "string"
        ? req.query.supplierId
        : undefined;

    const watchId =
      typeof req.query.watchId === "string"
        ? req.query.watchId
        : undefined;

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
        ? Math.min(
            requestedLimit,
            100,
          )
        : 20;

    const result =
      await getAllocations({
        supplierId,
        watchId,
        page,
        limit,
      });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת היסטוריית ההקצאות",
    });
  }
});

export default router;