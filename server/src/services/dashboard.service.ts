import {
    SaleStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

function getStartOfCurrentMonth(): Date {
    const now = new Date();

    return new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            1,
            0,
            0,
            0,
            0,
        ),
    );
}

export async function getAdminDashboard() {
    const startOfMonth =
        getStartOfCurrentMonth();

    const [
        activeSuppliers,
        activeWatches,
        warehouseInventory,
        monthlySales,
        monthlyRevenue,
        recentSales,
    ] = await Promise.all([
        prisma.supplier.count({
            where: {
                user: {
                    isActive: true,
                },
            },
        }),

        prisma.watch.count({
            where: {
                isActive: true,
            },
        }),

        prisma.warehouseInventory.aggregate({
            _sum: {
                quantityOnHand: true,
            },
        }),

        prisma.sale.count({
            where: {
                status:
                    SaleStatus.COMPLETED,

                soldAt: {
                    gte: startOfMonth,
                },
            },
        }),

        prisma.sale.aggregate({
            where: {
                status:
                    SaleStatus.COMPLETED,

                soldAt: {
                    gte: startOfMonth,
                },
            },

            _sum: {
                totalAmount: true,
            },
        }),

        prisma.sale.findMany({
            where: {
                status:
                    SaleStatus.COMPLETED,
            },

            take: 5,

            orderBy: {
                soldAt: "desc",
            },

            select: {
                id: true,
                totalAmount: true,
                soldAt: true,

                supplier: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },

                _count: {
                    select: {
                        items: true,
                    },
                },
            },
        }),
    ]);
    const topSupplierGroups =
        await prisma.sale.groupBy({
            by: [
                "supplierId",
            ],

            where: {
                status:
                    SaleStatus.COMPLETED,

                soldAt: {
                    gte: startOfMonth,
                },
            },

            _sum: {
                totalAmount: true,
            },

            _count: {
                id: true,
            },

            orderBy: {
                _sum: {
                    totalAmount: "desc",
                },
            },

            take: 5,
        });

    const supplierIds =
        topSupplierGroups.map(
            (item) => item.supplierId,
        );

    const suppliers =
        supplierIds.length > 0
            ? await prisma.supplier.findMany({
                where: {
                    id: {
                        in: supplierIds,
                    },
                },

                select: {
                    id: true,
                    companyName: true,
                },
            })
            : [];

    const supplierById =
        new Map(
            suppliers.map(
                (supplier) => [
                    supplier.id,
                    supplier,
                ],
            ),
        );

    const topSuppliers =
        topSupplierGroups.map(
            (group) => ({
                supplierId:
                    group.supplierId,

                companyName:
                    supplierById.get(
                        group.supplierId,
                    )?.companyName ??
                    "ספק לא ידוע",

                salesCount:
                    group._count.id,

                revenue:
                    group._sum.totalAmount ?? 0,
            }),
        );
    return {
        summary: {
            activeSuppliers,
            activeWatches,

            warehouseUnits:
                warehouseInventory
                    ._sum
                    .quantityOnHand ?? 0,

            monthlySales,

            monthlyRevenue:
                monthlyRevenue
                    ._sum
                    .totalAmount ?? 0,
        },

        recentSales,

        topSuppliers,
    };
}