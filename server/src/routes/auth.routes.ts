import { Router } from "express";

import { createAuthToken } from "../lib/auth.js";
import { verifyPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const COOKIE_NAME = "auth_token";

router.post("/login", async (req, res) => {
  const username =
    typeof req.body?.username === "string"
      ? req.body.username.trim()
      : "";

  const password =
    typeof req.body?.password === "string"
      ? req.body.password
      : "";

  if (!username || !password) {
    res.status(400).json({
      message: "יש להזין שם משתמש וסיסמה",
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      role: true,
      isActive: true,

      supplier: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    res.status(401).json({
      message: "שם המשתמש או הסיסמה שגויים",
    });
    return;
  }

  const isPasswordValid = await verifyPassword(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    res.status(401).json({
      message: "שם המשתמש או הסיסמה שגויים",
    });
    return;
  }

  const token = await createAuthToken(user.id);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,

      supplier: user.supplier
        ? {
            id: user.supplier.id,
            companyName: user.supplier.companyName,
          }
        : null,
    },
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    message: "התנתקת בהצלחה",
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    res.status(401).json({
      message: "נדרשת התחברות למערכת",
    });
    return;
  }

  res.status(200).json({
    user: authUser,
  });
});

export default router;