import { Router } from "express";

import {
  getSupplierInventory,
} from "../services/supplier-inventory.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const supplierId =
      req.authUser?.supplierId;

    if (!supplierId) {
      res.status(403).json({
        message:
          "המשתמש אינו משויך לספק",
      });

      return;
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search
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
        ? Math.min(requestedLimit, 100)
        : 20;

    const result =
      await getSupplierInventory({
        supplierId,
        search,
        page,
        limit,
      });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת המלאי",
    });
  }
});

export default router;