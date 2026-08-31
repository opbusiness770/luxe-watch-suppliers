import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

export default function HomeRedirect() {
  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <Navigate
      to={
        user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/supplier/dashboard"
      }
      replace
    />
  );
}