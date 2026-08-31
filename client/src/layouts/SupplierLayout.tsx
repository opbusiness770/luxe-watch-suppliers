import {
  Box,
  Button,
  Divider,
  Typography,
} from "@mui/material";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

const menuItems = [
  {
    label: "לוח בקרה",
    to: "/supplier/dashboard",
  },

  {
    label: "המלאי שלי",
    to: "/supplier/inventory",
  },

  {
    label: "דיווח מכירה",
    to: "/supplier/new-sale",
  },

  {
    label: "היסטוריית מכירות",
    to: "/supplier/sales",
  },
];

export default function SupplierLayout() {
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
          minWidth: 250,
          flexShrink: 0,

          bgcolor: "#FFFFFF",

          borderLeft:
            "1px solid",

          borderColor:
            "divider",

          p: 3,

          display: "flex",

          flexDirection:
            "column",

          boxSizing:
            "border-box",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color:
              "primary.main",

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

        <Box
          component="nav"
          sx={{
            display: "flex",

            flexDirection:
              "column",

            gap: 0.75,
          }}
        >
          {menuItems.map(
            (item) => (
              <Box
                key={
                  item.to
                }
                component={
                  NavLink
                }
                to={
                  item.to
                }
                sx={{
                  display:
                    "block",

                  px: 2,
                  py: 1.25,

                  borderRadius:
                    2,

                  color:
                    "text.primary",

                  textDecoration:
                    "none",

                  transition:
                    "background-color 150ms ease, color 150ms ease",

                  "&:hover": {
                    bgcolor:
                      "#F7F4EE",

                    color:
                      "primary.dark",
                  },

                  "&.active": {
                    bgcolor:
                      "#F3EDE2",

                    color:
                      "primary.dark",

                    fontWeight:
                      600,
                  },
                }}
              >
                {item.label}
              </Box>
            ),
          )}
        </Box>

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

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",
            }}
          >
            מחובר כ־
            {user?.username}
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            onClick={
              handleLogout
            }
          >
            התנתקות
          </Button>
        </Box>
      </Box>

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