import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <Paper
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 3,
        minHeight: 145,

        display: "flex",
        flexDirection: "column",
        justifyContent:
          "space-between",

        transition:
          "transform 160ms ease, box-shadow 160ms ease",

        "&:hover": {
          transform:
            "translateY(-2px)",

          boxShadow:
            "0 8px 30px rgba(20, 20, 20, 0.07)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,

          width: 4,
          height: "100%",

          bgcolor:
            "primary.main",
        }}
      />

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 1,
          fontWeight: 600,
        }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 1,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}