import {
  Router,
} from "express";

import {
  getSupplierDashboard,
} from "../services/supplier-dashboard.service.js";

const router = Router();

router.get(
  "/",
  async (
    req,
    res,
  ) => {
    try {
      const supplierId =
        req.authUser?.supplierId;

      if (!supplierId) {
        res.status(403).json({
          error: {
            code: "SUPPLIER_REQUIRED",
            message:
              "גישה זו מיועדת לספקים בלבד",
          },
        });

        return;
      }

      const dashboard =
        await getSupplierDashboard(
          supplierId,
        );

      res.status(200).json(
        dashboard,
      );
    } catch (error) {
      console.error(
        "Failed to load supplier dashboard:",
        error,
      );

      res.status(500).json({
        error: {
          code:
            "SUPPLIER_DASHBOARD_ERROR",

          message:
            "לא ניתן לטעון את לוח הבקרה",
        },
      });
    }
  },
);

export default router;