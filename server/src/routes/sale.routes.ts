import { Router } from "express";

import {
    createSale,
    getSupplierSaleById,
    getSupplierSales,
} from "../services/sale.service.js";

const router = Router();

function readOptionalString(
    value: unknown,
): string | null {
    if (
        typeof value !== "string"
    ) {
        return null;
    }

    const trimmed =
        value.trim();

    return trimmed || null;
}

function readMoney(
    value: unknown,
): number | null {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0
    ) {
        return null;
    }

    const cents =
        value * 100;

    if (
        Math.abs(
            cents -
            Math.round(cents),
        ) > 0.000001
    ) {
        return null;
    }

    return value;
}

router.post("/", async (req, res) => {
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

        if (
            !Array.isArray(
                req.body?.items,
            ) ||
            req.body.items.length === 0
        ) {
            res.status(400).json({
                message:
                    "יש להוסיף לפחות שעון אחד למכירה",
            });

            return;
        }

        if (
            req.body.items.length > 50
        ) {
            res.status(400).json({
                message:
                    "המכירה מכילה יותר מדי פריטים",
            });

            return;
        }

        const items = [];

        for (
            const rawItem of req.body.items
        ) {
            const watchId =
                typeof rawItem?.watchId ===
                    "string"
                    ? rawItem.watchId.trim()
                    : "";

            const quantity =
                rawItem?.quantity;

            const salePrice =
                readMoney(
                    rawItem?.salePrice,
                );

            if (!watchId) {
                res.status(400).json({
                    message:
                        "יש לבחור שעון",
                });

                return;
            }

            if (
                !Number.isInteger(
                    quantity,
                ) ||
                quantity <= 0
            ) {
                res.status(400).json({
                    message:
                        "כמות המכירה חייבת להיות מספר שלם וחיובי",
                });

                return;
            }

            if (salePrice === null) {
                res.status(400).json({
                    message:
                        "יש להזין מחיר מכירה תקין",
                });

                return;
            }

            items.push({
                watchId,
                quantity,
                salePrice,
            });
        }

        const result =
            await createSale({
                supplierId,
                items,

                notes:
                    readOptionalString(
                        req.body?.notes,
                    ),
            });

        if (
            result.status ===
            "DUPLICATE_WATCH"
        ) {
            res.status(400).json({
                message:
                    "אותו שעון מופיע יותר מפעם אחת במכירה",
            });

            return;
        }

        if (
            result.status ===
            "WATCH_NOT_IN_INVENTORY"
        ) {
            res.status(400).json({
                message:
                    "אחד השעונים אינו קיים במלאי שלך",
            });

            return;
        }

        if (
            result.status ===
            "PRICE_TOO_LOW"
        ) {
            res.status(400).json({
                message:
                    "מחיר המכירה נמוך ממחיר המכירה המינימלי שנקבע",

                requiredSalePrice:
                    result.requiredSalePrice,
            });

            return;
        }

        if (
            result.status ===
            "INSUFFICIENT_STOCK"
        ) {
            res.status(400).json({
                message:
                    "אין מספיק מלאי לביצוע המכירה",

                currentQuantity:
                    result.currentQuantity,
            });

            return;
        }

        if (result.status !== "SUCCESS") {
            res.status(500).json({
                message:
                    "אירעה שגיאה בלתי צפויה בשמירת המכירה",
            });

            return;
        }

        res.status(201).json({
            message:
                "המכירה נשמרה בהצלחה",

            sale:
                result.sale,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "אירעה שגיאה בשמירת המכירה",
        });
    }
});

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

        const requestedPage =
            Number(req.query.page);

        const requestedLimit =
            Number(req.query.limit);

        const page =
            Number.isInteger(
                requestedPage,
            ) &&
                requestedPage > 0
                ? requestedPage
                : 1;

        const limit =
            Number.isInteger(
                requestedLimit,
            ) &&
                requestedLimit > 0
                ? Math.min(
                    requestedLimit,
                    100,
                )
                : 20;

        const result =
            await getSupplierSales({
                supplierId,
                page,
                limit,
            });

        res.status(200).json(
            result,
        );
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
        const supplierId =
            req.authUser?.supplierId;

        if (!supplierId) {
            res.status(403).json({
                message:
                    "המשתמש אינו משויך לספק",
            });

            return;
        }

        const sale =
            await getSupplierSaleById(
                supplierId,
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