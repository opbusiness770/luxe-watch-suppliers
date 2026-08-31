import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  HttpError,
} from "../../api/http";

import {
  useAuth,
} from "../../context/AuthContext";

export default function LoginPage() {
  const {
    user,
    isLoading,
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return (
      <Navigate
        to={
          user.role === "ADMIN"
            ? "/admin/dashboard"
            : "/supplier/dashboard"
        }
        replace
      />
    );
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedUsername =
      username.trim();

    if (
      !normalizedUsername ||
      !password
    ) {
      setError(
        "יש להזין שם משתמש וסיסמה",
      );

      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser =
        await login(
          normalizedUsername,
          password,
        );

      navigate(
        authenticatedUser.role ===
          "ADMIN"
          ? "/admin/dashboard"
          : "/supplier/dashboard",
        {
          replace: true,
        },
      );
    } catch (error) {
      if (
        error instanceof HttpError
      ) {
        setError(error.message);
      } else {
        setError(
          "לא ניתן להתחבר למערכת כרגע",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent:
          "center",

        px: 2,

        background:
          "linear-gradient(145deg, #F8F7F4 0%, #EEEAE2 100%)",
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 430,

          p: {
            xs: 3,
            sm: 5,
          },

          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color:
                "text.primary",

              letterSpacing: 2,

              fontWeight: 600,
            }}
          >
            LUXE WATCH
          </Typography>

          <Typography
            color="primary.main"
            sx={{
              mt: 1,
              fontWeight: 500,
            }}
          >
            פורטל ספקים
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
            }}
          >
            התחברו למערכת לניהול מלאי ומכירות
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          label="שם משתמש"
          value={username}
          onChange={(event) =>
            setUsername(
              event.target.value,
            )
          }
          autoComplete="username"
          fullWidth
          disabled={isSubmitting}
          sx={{
            mb: 2,
          }}
        />

        <TextField
          label="סיסמה"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
          autoComplete="current-password"
          fullWidth
          disabled={isSubmitting}
          sx={{
            mb: 3,
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            minHeight: 48,
          }}
        >
          {isSubmitting ? (
            <CircularProgress
              size={22}
              color="inherit"
            />
          ) : (
            "התחברות"
          )}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 3,
          }}
        >
          הגישה למערכת מיועדת למשתמשים מורשים בלבד
        </Typography>
      </Paper>
    </Box>
  );
}