import {
  Router,
} from "express";

import {
  createWatchUploadSignature,
} from "../services/upload.service.js";

const router = Router();

/*
 * POST /api/admin/uploads/signature
 *
 * Creates a short-lived Cloudinary upload signature.
 *
 * Authentication and ADMIN authorization are
 * enforced in app.ts before this router is reached.
 */
router.post(
  "/signature",
  (_req, res) => {
    try {
      const uploadSignature =
        createWatchUploadSignature();

      res.status(200).json(
        uploadSignature,
      );
    } catch (error) {
      console.error(
        "Failed to create Cloudinary upload signature:",
        error,
      );

      res.status(500).json({
        message:
          "לא ניתן להכין את העלאת התמונה",
      });
    }
  },
);

export default router;