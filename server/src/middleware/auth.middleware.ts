import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { verifyAuthToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.auth_token as string | undefined;

  if (!token) {
    res.status(401).json({
      message: "נדרשת התחברות למערכת",
    });
    return;
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    res.status(401).json({
      message: "ההתחברות אינה תקפה",
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,

      supplier: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    res.status(401).json({
      message: "המשתמש אינו פעיל",
    });
    return;
  }

  req.authUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    supplierId: user.supplier?.id ?? null,
  };

  next();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.authUser?.role !== "ADMIN") {
    res.status(403).json({
      message: "אין לך הרשאה לבצע פעולה זו",
    });
    return;
  }

  next();
}

export function requireSupplier(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    req.authUser?.role !== "SUPPLIER" ||
    !req.authUser.supplierId
  ) {
    res.status(403).json({
      message: "אין לך הרשאה לבצע פעולה זו",
    });
    return;
  }

  next();
}