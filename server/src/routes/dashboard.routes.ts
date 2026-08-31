import { Router } from "express";

import {
  getAdminDashboard,
} from "../services/dashboard.service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const dashboard =
      await getAdminDashboard();

    res.status(200).json(
      dashboard,
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "אירעה שגיאה בטעינת לוח הבקרה",
    });
  }
});

export default router;