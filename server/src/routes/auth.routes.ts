import { Router } from "express";

import {
  createAuthToken,
} from "../lib/auth.js";

import {
  verifyPassword,
} from "../lib/password.js";

import {
  prisma,
} from "../lib/prisma.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

const COOKIE_NAME =
  "auth_token";

/*
 * POST /api/auth/login
 *
 * Authenticates a user using username + password
 * and stores the JWT inside an HttpOnly cookie.
 */
router.post(
  "/login",
  async (req, res) => {
    try {
      const username =
        typeof req.body
          ?.username ===
        "string"
          ? req.body.username.trim()
          : "";

      const password =
        typeof req.body
          ?.password ===
        "string"
          ? req.body.password
          : "";

      if (
        !username ||
        !password
      ) {
        res.status(400).json({
          message:
            "יש להזין שם משתמש וסיסמה",
        });

        return;
      }

      const user =
        await prisma.user.findUnique({
          where: {
            username,
          },

          select: {
            id: true,
            username: true,

            passwordHash:
              true,

            role: true,
            isActive: true,

            supplier: {
              select: {
                id: true,

                contactName:
                  true,
              },
            },
          },
        });

      /*
       * Do not reveal whether the username
       * exists or whether the account is blocked.
       */
      if (
        !user ||
        !user.isActive
      ) {
        res.status(401).json({
          message:
            "שם המשתמש או הסיסמה שגויים",
        });

        return;
      }

      const isPasswordValid =
        await verifyPassword(
          password,
          user.passwordHash,
        );

      if (!isPasswordValid) {
        res.status(401).json({
          message:
            "שם המשתמש או הסיסמה שגויים",
        });

        return;
      }

      const token =
        await createAuthToken(
          user.id,
        );

      res.cookie(
        COOKIE_NAME,
        token,
        {
          httpOnly: true,

          secure:
            process.env
              .NODE_ENV ===
            "production",

          sameSite: "lax",

          maxAge:
            8 *
            60 *
            60 *
            1000,

          path: "/",
        },
      );

      res.status(200).json({
        user: {
          id: user.id,

          username:
            user.username,

          role:
            user.role,

          supplier:
            user.supplier
              ? {
                  id:
                    user.supplier
                      .id,

                  contactName:
                    user.supplier
                      .contactName,
                }
              : null,
        },
      });
    } catch (error) {
      console.error(
        "Login failed:",
        error,
      );

      res.status(500).json({
        message:
          "אירעה שגיאה במהלך ההתחברות",
      });
    }
  },
);

/*
 * POST /api/auth/logout
 *
 * Removes the authentication cookie.
 */
router.post(
  "/logout",
  (_req, res) => {
    res.clearCookie(
      COOKIE_NAME,
      {
        httpOnly: true,

        secure:
          process.env
            .NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",
      },
    );

    res.status(200).json({
      message:
        "התנתקת בהצלחה",
    });
  },
);

/*
 * GET /api/auth/me
 *
 * Returns the currently authenticated user.
 * requireAuth already validates the cookie/token
 * and loads the user information.
 */
router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    const authUser =
      req.authUser;

    if (!authUser) {
      res.status(401).json({
        message:
          "נדרשת התחברות למערכת",
      });

      return;
    }

    res.status(200).json({
      user: authUser,
    });
  },
);

export default router;