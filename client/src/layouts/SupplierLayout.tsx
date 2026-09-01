import {
  useState,
} from "react";

import {
  Box,
  Button,
  Divider,
  Drawer,
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

import LuxuryHeader from "../components/layout/LuxuryHeader";

import LiveClockBackground from "../components/common/LiveClockBackground";

const DRAWER_WIDTH = 300;

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

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);

    await logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }

  function handleNavigation() {
    setMenuOpen(false);
  }

  return (
    <Box
      sx={{
        minHeight:
          "100vh",

        position:
          "relative",

        isolation:
          "isolate",

        overflowX:
          "hidden",

        background:
          "radial-gradient(circle at 10% 0%, rgba(179,145,84,0.13), transparent 30%), radial-gradient(circle at 85% 15%, rgba(212,188,138,0.10), transparent 26%), linear-gradient(180deg, #FBFAF7 0%, #F7F5F1 100%)",
      }}
    >
      {/* Live decorative clock background */}
      <LiveClockBackground />

      {/* Top header */}
      <Box
        sx={{
          position:
            "relative",

          zIndex:
            2,
        }}
      >
        <LuxuryHeader
          subtitle="פורטל ספקים"
          onMenuClick={() =>
            setMenuOpen(
              true,
            )
          }
        />
      </Box>

      {/* Navigation drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() =>
          setMenuOpen(false)
        }
        ModalProps={{
          keepMounted: true,
        }}
        slotProps={{
          paper: {
            sx: {
              width:
                DRAWER_WIDTH,

              maxWidth:
                "88vw",

              direction:
                "rtl",

              borderLeft:
                "1px solid rgba(179,145,84,0.22)",

              background:
                "linear-gradient(180deg, #FFFFFF 0%, #FBF9F4 100%)",

              boxShadow:
                "-20px 0 60px rgba(50,38,18,0.10)",
            },
          },
        }}
      >
        <Box
          sx={{
            height:
              "100%",

            p: 3,

            display:
              "flex",

            flexDirection:
              "column",
          }}
        >
          {/* Drawer brand */}
          <Box
            sx={{
              pb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color:
                  "primary.main",

                letterSpacing:
                  1.4,

                fontWeight:
                  700,
              }}
            >
              LUXE WATCH
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              פורטל ספקים
            </Typography>
          </Box>

          <Divider
            sx={{
              my: 3,
            }}
          />

          {/* Navigation */}
          <Box
            component="nav"
            sx={{
              display:
                "flex",

              flexDirection:
                "column",

              gap: 1,
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
                  onClick={
                    handleNavigation
                  }
                  sx={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    minHeight:
                      50,

                    px: 2.3,
                    py: 1.3,

                    borderRadius:
                      2.5,

                    color:
                      "text.primary",

                    textDecoration:
                      "none",

                    fontSize:
                      "0.98rem",

                    fontWeight:
                      500,

                    transition:
                      "all 170ms ease",

                    "&:hover": {
                      bgcolor:
                        "rgba(179,145,84,0.09)",

                      color:
                        "primary.dark",

                      transform:
                        "translateX(-3px)",
                    },

                    "&.active": {
                      bgcolor:
                        "rgba(179,145,84,0.14)",

                      color:
                        "primary.dark",

                      fontWeight:
                        700,

                      boxShadow:
                        "inset -4px 0 0 #B39154, 0 5px 18px rgba(179,145,84,0.08)",
                    },
                  }}
                >
                  {
                    item.label
                  }
                </Box>
              ),
            )}
          </Box>

          {/* Logged-in user */}
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

            <Box
              sx={{
                mb: 2.5,

                p: 2,

                borderRadius:
                  2.5,

                bgcolor:
                  "rgba(179,145,84,0.07)",

                border:
                  "1px solid rgba(179,145,84,0.15)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                משתמש מחובר
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,

                  fontWeight:
                    700,

                  overflow:
                    "hidden",

                  textOverflow:
                    "ellipsis",

                  whiteSpace:
                    "nowrap",
                }}
              >
                {
                  user?.username
                }
              </Typography>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              onClick={
                handleLogout
              }
              sx={{
                minHeight:
                  48,

                fontWeight:
                  700,
              }}
            >
              התנתקות
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Page content */}
      <Box
        component="main"
        sx={{
          position:
            "relative",

          zIndex:
            1,

          width:
            "100%",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
            xl: 6,
          },

          py: {
            xs: 3,
            md: 4,
          },
        }}
      >
        <Box
          sx={{
            width:
              "100%",

            maxWidth:
              1500,

            mx:
              "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}