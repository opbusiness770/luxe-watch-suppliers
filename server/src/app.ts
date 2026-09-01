import cookieParser from "cookie-parser";

import express from "express";

import path from "node:path";

import {
  fileURLToPath,
} from "node:url";

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

import uploadRoutes from "./routes/upload.routes.js";

const app =
  express();

const currentFilePath =
  fileURLToPath(
    import.meta.url,
  );

const currentDirectory =
  path.dirname(
    currentFilePath,
  );

const clientDistPath =
  path.resolve(
    currentDirectory,
    "../../client/dist",
  );

app.disable(
  "x-powered-by",
);

app.use(
  express.json({
    limit:
      "100kb",
  }),
);

app.use(
  cookieParser(),
);

app.get(
  "/api/health",
  (_req, res) => {
    res.status(200).json({
      service:
        "luxe-watch-api",

      status:
        "ok",
    });
  },
);

app.use(
  "/api/auth",
  authRoutes,
);

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

/*
 * Cloudinary uploads.
 *
 * Only authenticated ADMIN users may request
 * an upload signature.
 */
app.use(
  "/api/admin/uploads",
  requireAuth,
  requireAdmin,
  uploadRoutes,
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

/*
 * Any request that starts with /api and did not
 * match one of the routes above is an API 404.
 *
 * This must come before the React SPA fallback,
 * otherwise a missing API route could accidentally
 * receive index.html.
 */
app.use(
  "/api",
  (_req, res) => {
    res.status(404).json({
      message:
        "API route not found",
    });
  },
);

/*
 * In production, Express serves the Vite build.
 *
 * This keeps the React frontend and the API on the
 * same origin, so the HttpOnly authentication cookie
 * can be used without cross-origin CORS handling.
 */
if (
  process.env.NODE_ENV ===
  "production"
) {
  app.use(
    express.static(
      clientDistPath,
    ),
  );

  /*
   * React Router SPA fallback.
   *
   * Express 5 requires a named wildcard.
   * /{*splat} also matches the root path.
   */
  app.get(
    "/{*splat}",
    (_req, res) => {
      res.sendFile(
        path.join(
          clientDistPath,
          "index.html",
        ),
      );
    },
  );
}

export default app;
