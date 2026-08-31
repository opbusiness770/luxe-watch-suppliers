import { Router } from "express";

import {
  SaleStatus,
} from "../generated/prisma/client.js";

import {
  getAdminSaleById,
  getAdminSales,
} from "../services/admin-sale.service.js";

const router = Router();

function parseDate(
  value: unknown,
): Date | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

router.get("/", async (req, res) => {
  try {
    const supplierId =
      typeof req.query.supplierId === "string"
        ? req.query.supplierId
        : undefined;

    let status:
      | SaleStatus
      | undefined;

    if (
      req.query.status ===
      SaleStatus.COMPLETED
    ) {
      status =
        SaleStatus.COMPLETED;
    }

    if (
      req.query.status ===
      SaleStatus.CANCELLED
    ) {
      status =
        SaleStatus.CANCELLED;
    }

    const from =
      parseDate(req.query.from);

    const to =
      parseDate(req.query.to);

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
      await getAdminSales({
        supplierId,
        status,
        from,
        to,
        page,
        limit,
      });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת המכירות",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const sale =
      await getAdminSaleById(
        req.params.id,
      );

    if (!sale) {
      res.status(404).json({
        message:
          "המכירה לא נמצאה",
      });

      return;
    }

    res.status(200).json({
      sale,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת המכירה",
    });
  }
});

export default router;