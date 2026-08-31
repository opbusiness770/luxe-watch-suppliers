import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import SupplierLayout from "./layouts/SupplierLayout";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import SuppliersPage from "./pages/admin/SuppliersPage";

import LoginPage from "./pages/auth/LoginPage";

import SupplierDashboardPage from "./pages/supplier/SupplierDashboardPage";

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