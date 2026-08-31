import {
  Typography,
} from "@mui/material";

export default function AdminDashboardPage() {
  return (
    <>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
        }}
      >
        לוח בקרה
      </Typography>

      <Typography
        color="text.secondary"
      >
        ברוכים הבאים למערכת ניהול הספקים
      </Typography>
    </>
  );
}