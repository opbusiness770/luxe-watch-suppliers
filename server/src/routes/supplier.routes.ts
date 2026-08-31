import { Router } from "express";

import {
  createSupplier,
  getSupplierById,
  getSuppliers,
  resetSupplierPassword,
  setSupplierStatus,
  updateSupplier,
} from "../services/supplier.service.js";

const router = Router();

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

router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const suppliers = await getSuppliers(search);

    res.status(200).json({
      suppliers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "אירעה שגיאה בטעינת הספקים",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supplier =
      await getSupplierById(req.params.id);

    if (!supplier) {
      res.status(404).json({
        message: "הספק לא נמצא",
      });
      return;
    }

    res.status(200).json({
      supplier,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "אירעה שגיאה בטעינת הספק",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const username =
      typeof req.body?.username === "string"
        ? req.body.username.trim()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    const companyName =
      typeof req.body?.companyName === "string"
        ? req.body.companyName.trim()
        : "";

    const contactName =
      typeof req.body?.contactName === "string"
        ? req.body.contactName.trim()
        : "";

    const email =
      readOptionalString(req.body?.email);

    const phone =
      readOptionalString(req.body?.phone);

    const address =
      readOptionalString(req.body?.address);

    const notes =
      readOptionalString(req.body?.notes);

    if (
      !username ||
      !password ||
      !companyName ||
      !contactName
    ) {
      res.status(400).json({
        message:
          "שם משתמש, סיסמה, שם חברה ושם איש קשר הם שדות חובה",
      });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({
        message:
          "שם המשתמש חייב להכיל לפחות 3 תווים",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        message:
          "הסיסמה חייבת להכיל לפחות 8 תווים",
      });
      return;
    }

    const supplier = await createSupplier({
      username,
      password,
      companyName,
      contactName,
      email,
      phone,
      address,
      notes,
    });

    res.status(201).json({
      message: "הספק נוצר בהצלחה",
      supplier,
    });
  } catch (error) {
    console.error(error);

    res.status(409).json({
      message:
        "לא ניתן ליצור את הספק. ייתכן ששם המשתמש או כתובת האימייל כבר קיימים",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const companyName =
      req.body?.companyName === undefined
        ? undefined
        : readOptionalString(
            req.body.companyName,
          );

    const contactName =
      req.body?.contactName === undefined
        ? undefined
        : readOptionalString(
            req.body.contactName,
          );

    if (companyName === null) {
      res.status(400).json({
        message: "שם החברה אינו יכול להיות ריק",
      });
      return;
    }

    if (contactName === null) {
      res.status(400).json({
        message:
          "שם איש הקשר אינו יכול להיות ריק",
      });
      return;
    }

    const supplier = await updateSupplier(
      req.params.id,
      {
        companyName,
        contactName,
        email: readOptionalString(
          req.body?.email,
        ),
        phone: readOptionalString(
          req.body?.phone,
        ),
        address: readOptionalString(
          req.body?.address,
        ),
        notes: readOptionalString(
          req.body?.notes,
        ),
      },
    );

    res.status(200).json({
      message: "פרטי הספק עודכנו בהצלחה",
      supplier,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      message:
        "הספק לא נמצא או שלא ניתן לעדכן אותו",
    });
  }
});

router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      if (
        typeof req.body?.isActive !== "boolean"
      ) {
        res.status(400).json({
          message:
            "יש להעביר ערך תקין עבור מצב הספק",
        });
        return;
      }

      const result = await setSupplierStatus(
        req.params.id,
        req.body.isActive,
      );

      if (!result) {
        res.status(404).json({
          message: "הספק לא נמצא",
        });
        return;
      }

      res.status(200).json({
        message: result.isActive
          ? "הספק הופעל בהצלחה"
          : "הספק נחסם בהצלחה",

        isActive: result.isActive,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "לא ניתן לעדכן את מצב הספק",
      });
    }
  },
);

router.post(
  "/:id/reset-password",
  async (req, res) => {
    try {
      const password =
        typeof req.body?.password === "string"
          ? req.body.password
          : "";

      if (password.length < 8) {
        res.status(400).json({
          message:
            "הסיסמה חייבת להכיל לפחות 8 תווים",
        });
        return;
      }

      const result =
        await resetSupplierPassword(
          req.params.id,
          password,
        );

      if (!result) {
        res.status(404).json({
          message: "הספק לא נמצא",
        });
        return;
      }

      res.status(200).json({
        message: "הסיסמה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "אירעה שגיאה בעדכון הסיסמה",
      });
    }
  },
);

export default router;