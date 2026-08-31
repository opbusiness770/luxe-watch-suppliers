import {
  Box,
  Divider,
  Typography,
} from "@mui/material";

import {
  Outlet,
} from "react-router-dom";

export default function SupplierLayout() {
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
          borderLeft:
            "1px solid",
          borderColor:
            "divider",
          p: 3,
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

        <Typography>
          לוח בקרה
        </Typography>

        <Typography sx={{ mt: 2 }}>
          המלאי שלי
        </Typography>

        <Typography sx={{ mt: 2 }}>
          מכירות
        </Typography>

        <Typography sx={{ mt: 2 }}>
          היסטוריית מכירות
        </Typography>
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