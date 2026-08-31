import cookieParser from "cookie-parser";
import express from "express";

import {
  requireAdmin,
  requireAuth,
  requireSupplier,
} from "./middleware/auth.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import watchRoutes from "./routes/watch.routes.js";
import allocationRoutes from "./routes/allocation.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import supplierInventoryRoutes from "./routes/supplier-inventory.routes.js";
import adminSaleRoutes from "./routes/admin-sale.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import supplierDashboardRoutes from "./routes/supplier-dashboard.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    service: "luxe-watch-api",
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/admin/suppliers",
  requireAuth,
  requireAdmin,
  supplierRoutes,
);

app.use(
  "/api/admin/watches",
  requireAuth,
  requireAdmin,
  watchRoutes,
);

app.use(
  "/api/admin/allocations",
  requireAuth,
  requireAdmin,
  allocationRoutes,
);

app.use(
  "/api/supplier/inventory",
  requireAuth,
  requireSupplier,
  supplierInventoryRoutes,
);

app.use(
  "/api/supplier/sales",
  requireAuth,
  requireSupplier,
  saleRoutes,
);

app.use(
  "/api/admin/sales",
  requireAuth,
  requireAdmin,
  adminSaleRoutes,
);

app.use(
  "/api/admin/dashboard",
  requireAuth,
  requireAdmin,
  dashboardRoutes,
);

app.use(
  "/api/supplier/dashboard",
  requireAuth,
  requireSupplier,
  supplierDashboardRoutes,
);

export default app;