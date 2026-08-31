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

export default function AdminLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  async function handleLogout() {
    await logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 250,
          flexShrink: 0,
          bgcolor: "#FFFFFF",
          borderLeft: "1px solid",
          borderColor: "divider",
          p: 3,

          display: "flex",
          flexDirection: "column",
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
          ממשק מנהל
        </Typography>

        <Divider
          sx={{
            my: 3,
          }}
        />

        <Typography>
          לוח בקרה
        </Typography>

        <Typography
          sx={{
            mt: 2,
          }}
        >
          ספקים
        </Typography>

        <Typography
          sx={{
            mt: 2,
          }}
        >
          שעונים
        </Typography>

        <Typography
          sx={{
            mt: 2,
          }}
        >
          הקצאות מלאי
        </Typography>

        <Typography
          sx={{
            mt: 2,
          }}
        >
          מכירות
        </Typography>

        <Box
          sx={{
            mt: "auto",
            pt: 4,
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
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