import {
  Box,
  Button,
  Typography,
} from "@mui/material";

type LuxuryHeaderProps = {
  subtitle: string;
  onMenuClick: () => void;
};

export default function LuxuryHeader({
  subtitle,
  onMenuClick,
}: LuxuryHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,

        height: {
          xs: 70,
          md: 80,
        },

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        px: {
          xs: 2,
          md: 4,
        },

        bgcolor:
          "rgba(255,255,255,0.88)",

        backdropFilter:
          "blur(18px)",

        borderBottom:
          "1px solid rgba(179,145,84,0.18)",

        boxShadow:
          "0 6px 30px rgba(45,35,18,0.04)",
      }}
    >
      {/* Menu - always on the right */}
      <Button
        variant="outlined"
        onClick={onMenuClick}
        sx={{
          position: "absolute",

          right: {
            xs: 16,
            md: 32,
          },

          minWidth: {
            xs: 48,
            sm: 120,
          },

          borderColor:
            "rgba(179,145,84,0.5)",

          bgcolor:
            "rgba(255,255,255,0.75)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: "1.25rem",
            ml: {
              xs: 0,
              sm: 1,
            },
          }}
        >
          ☰
        </Box>

        <Box
          component="span"
          sx={{
            display: {
              xs: "none",
              sm: "inline",
            },
          }}
        >
          תפריט
        </Box>
      </Button>

      {/* Brand */}
      <Box
        sx={{
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            color: "primary.main",

            fontWeight: 700,

            letterSpacing: 2,

            fontSize: {
              xs: "1rem",
              md: "1.2rem",
            },
          }}
        >
          LUXE WATCH
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}