import {
  Typography,
} from "@mui/material";

export default function SupplierDashboardPage() {
  return (
    <>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
        }}
      >
        לוח הבקרה שלי
      </Typography>

      <Typography
        color="text.secondary"
      >
        כאן יוצגו המלאי והמכירות שלך
      </Typography>
    </>
  );
}