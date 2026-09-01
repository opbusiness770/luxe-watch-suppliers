import {
  useState,
} from "react";

import type {
  FormEvent,
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

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

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

          bgcolor:
            "background.default",
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
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !username.trim() ||
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
      const loggedUser =
        await login(
          username.trim(),
          password,
        );

      navigate(
        loggedUser.role ===
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
        setError(
          error.message,
        );
      } else {
        setError(
          "אירעה שגיאה בתקשורת עם השרת",
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

        p: {
          xs: 2,
          sm: 3,
          md: 5,
        },

        background:
          "radial-gradient(circle at 15% 15%, rgba(179,145,84,0.18), transparent 30%), radial-gradient(circle at 85% 85%, rgba(212,188,138,0.14), transparent 30%), linear-gradient(135deg, #FBFAF7 0%, #F3EFE6 50%, #FAF9F6 100%)",
      }}
    >
      <Paper
        sx={{
          width: "100%",

          maxWidth: 1120,

          minHeight: {
            xs: "auto",
            md: 620,
          },

          overflow:
            "hidden",

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 0.9fr",
          },

          border:
            "1px solid rgba(179,145,84,0.22)",

          borderRadius: {
            xs: 3,
            md: 4,
          },

          boxShadow:
            "0 30px 90px rgba(64,50,25,0.13)",
        }}
      >
        {/* Login form */}
        <Box
          sx={{
            p: {
              xs: 3,
              sm: 5,
              md: 7,
            },

            display: "flex",

            flexDirection:
              "column",

            justifyContent:
              "center",

            bgcolor:
              "rgba(255,255,255,0.97)",
          }}
        >
          <Box
            sx={{
              maxWidth: 430,

              width: "100%",

              mx: "auto",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color:
                  "primary.main",

                letterSpacing: 2,

                fontWeight: 700,
              }}
            >
              LUXE WATCH
            </Typography>

            <Typography
              variant="h3"
              sx={{
                mt: 1,

                mb: 1,

                fontWeight: 600,

                fontSize: {
                  xs: "2rem",
                  md: "2.6rem",
                },
              }}
            >
              ברוכים הבאים
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mb: 4,
              }}
            >
              התחברו לפורטל הניהול והספקים
            </Typography>

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

            <Box
              component="form"
              onSubmit={
                handleSubmit
              }
            >
              <TextField
                label="שם משתמש"
                value={username}
                onChange={(
                  event,
                ) => {
                  setError("");

                  setUsername(
                    event.target
                      .value,
                  );
                }}
                autoComplete="username"
                fullWidth
                sx={{
                  mb: 2.25,
                }}
              />

              <TextField
                label="סיסמה"
                type="password"
                value={password}
                onChange={(
                  event,
                ) => {
                  setError("");

                  setPassword(
                    event.target
                      .value,
                  );
                }}
                autoComplete="current-password"
                fullWidth
                sx={{
                  mb: 3,
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={
                  isSubmitting
                }
                sx={{
                  minHeight: 50,
                }}
              >
                {isSubmitting
                  ? "מתחבר..."
                  : "התחברות"}
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",

                textAlign:
                  "center",

                mt: 3,
              }}
            >
              הגישה למערכת מיועדת למשתמשים מורשים בלבד
            </Typography>
          </Box>
        </Box>

        {/* Luxury panel */}
        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },

            position: "relative",

            overflow:
              "hidden",

            alignItems: "center",

            justifyContent:
              "center",

            flexDirection:
              "column",

            p: 5,

            textAlign:
              "center",

            background:
              "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.85), transparent 22%), linear-gradient(145deg, #F7F0E2 0%, #E9D6AD 48%, #C6A461 100%)",
          }}
        >
          {/* Decorative glow */}
          <Box
            sx={{
              position:
                "absolute",

              width: 420,
              height: 420,

              borderRadius:
                "50%",

              border:
                "1px solid rgba(255,255,255,0.45)",

              boxShadow:
                "0 0 80px rgba(255,255,255,0.32)",
            }}
          />

          <Box
            sx={{
              position:
                "absolute",

              width: 310,
              height: 310,

              borderRadius:
                "50%",

              border:
                "1px solid rgba(146,115,63,0.25)",
            }}
          />

          {/* Watch-inspired dial */}
          <Box
            sx={{
              position:
                "relative",

              width: 220,
              height: 220,

              borderRadius:
                "50%",

              bgcolor:
                "rgba(255,255,255,0.34)",

              border:
                "1px solid rgba(255,255,255,0.7)",

              boxShadow:
                "0 24px 70px rgba(95,67,24,0.18), inset 0 0 35px rgba(255,255,255,0.55)",

              backdropFilter:
                "blur(8px)",

              mb: 5,

              "&::before": {
                content: '""',

                position:
                  "absolute",

                width: 3,
                height: 72,

                bgcolor:
                  "#92733F",

                top: 40,
                left: "50%",

                borderRadius:
                  4,

                transformOrigin:
                  "bottom center",

                transform:
                  "translateX(-50%) rotate(28deg)",
              },

              "&::after": {
                content: '""',

                position:
                  "absolute",

                width: 3,
                height: 54,

                bgcolor:
                  "#B39154",

                top: 57,
                left: "50%",

                borderRadius:
                  4,

                transformOrigin:
                  "bottom center",

                transform:
                  "translateX(-50%) rotate(-55deg)",
              },
            }}
          >
            <Box
              sx={{
                position:
                  "absolute",

                width: 12,
                height: 12,

                borderRadius:
                  "50%",

                bgcolor:
                  "#92733F",

                top: "50%",
                left: "50%",

                transform:
                  "translate(-50%, -50%)",
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              position:
                "relative",

              color:
                "#614A26",

              fontWeight: 700,

              letterSpacing: 2,
            }}
          >
            LUXE WATCH
          </Typography>

          <Typography
            sx={{
              position:
                "relative",

              mt: 1,

              maxWidth: 320,

              color:
                "rgba(78,57,26,0.78)",
            }}
          >
            מערכת חכמה לניהול מלאי, ספקים ומכירות
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}