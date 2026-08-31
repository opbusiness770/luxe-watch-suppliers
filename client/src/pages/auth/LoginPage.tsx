import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 5,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            letterSpacing: 1,
          }}
        >
          LUXE WATCH
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 4,
          }}
        >
          פורטל ספקים
        </Typography>

        <Typography
          sx={{
            mb: 3,
          }}
        >
          מסך ההתחברות ייבנה בשלב הבא
        </Typography>

        <Button
          variant="contained"
          fullWidth
        >
          התחברות
        </Button>
      </Paper>
    </Box>
  );
}