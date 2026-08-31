import {
  Box,
  Button,
  Divider,
  Typography,
} from "@mui/material";

import {
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

export default function SupplierLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    await logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 250,
          minWidth: 250,
          flexShrink: 0,

          bgcolor: "#FFFFFF",

          borderLeft: "1px solid",
          borderColor: "divider",

          p: 3,

          display: "flex",
          flexDirection: "column",

          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "primary.main",
            letterSpacing: 1,
          }}
        >
          LUXE WATCH
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          פורטל ספקים
        </Typography>

        <Divider
          sx={{
            my: 3,
          }}
        />

        {/* Navigation */}
        <Box>
          <Typography>
            לוח בקרה
          </Typography>

          <Typography
            sx={{
              mt: 2,
            }}
          >
            המלאי שלי
          </Typography>

          <Typography
            sx={{
              mt: 2,
            }}
          >
            מכירות
          </Typography>

          <Typography
            sx={{
              mt: 2,
            }}
          >
            היסטוריית מכירות
          </Typography>
        </Box>

        {/* User + Logout */}
        <Box
          sx={{
            mt: "auto",
            pt: 4,
            width: "100%",
          }}
        >
          <Divider
            sx={{
              mb: 3,
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            מחובר כ־{user?.username}
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleLogout}
          >
            התנתקות
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,

          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}