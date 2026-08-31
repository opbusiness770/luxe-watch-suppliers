import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import SupplierLayout from "./layouts/SupplierLayout";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminSalesPage from "./pages/admin/AdminSalesPage";
import AllocationsPage from "./pages/admin/AllocationsPage";
import SuppliersPage from "./pages/admin/SuppliersPage";
import WatchesPage from "./pages/admin/WatchesPage";

import LoginPage from "./pages/auth/LoginPage";

import NewSalePage from "./pages/supplier/NewSalePage";
import SupplierDashboardPage from "./pages/supplier/SupplierDashboardPage";
import SupplierInventoryPage from "./pages/supplier/SupplierInventoryPage";
import SupplierSalesPage from "./pages/supplier/SupplierSalesPage";

import HomeRedirect from "./routes/HomeRedirect";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeRedirect />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
            ]}
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={
            <AdminDashboardPage />
          }
        />

        <Route
          path="suppliers"
          element={
            <SuppliersPage />
          }
        />

        <Route
          path="watches"
          element={
            <WatchesPage />
          }
        />

        <Route
          path="allocations"
          element={
            <AllocationsPage />
          }
        />

        <Route
          path="sales"
          element={
            <AdminSalesPage />
          }
        />
      </Route>

      <Route
        path="/supplier"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPPLIER",
            ]}
          >
            <SupplierLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={
            <SupplierDashboardPage />
          }
        />

        <Route
          path="inventory"
          element={
            <SupplierInventoryPage />
          }
        />

        <Route
          path="new-sale"
          element={
            <NewSalePage />
          }
        />

        <Route
          path="sales"
          element={
            <SupplierSalesPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <HomeRedirect />
        }
      />
    </Routes>
  );
}