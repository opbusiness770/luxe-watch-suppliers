import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  direction: "rtl",

  palette: {
    mode: "light",

    primary: {
      main: "#B39154",
      dark: "#92733F",
      light: "#D4BC8A",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#A7A9AC",
      dark: "#737579",
      light: "#D7D8DA",
    },

    background: {
      default: "#F8F7F4",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#1D1D1F",
      secondary: "#696969",
    },

    divider: "#E7E4DE",
  },

  typography: {
    fontFamily: [
      "Arial",
      "Segoe UI",
      "sans-serif",
    ].join(","),

    h1: {
      fontWeight: 600,
    },

    h2: {
      fontWeight: 600,
    },

    h3: {
      fontWeight: 600,
    },

    h4: {
      fontWeight: 600,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 42,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #ECE9E3",
          boxShadow:
            "0 4px 20px rgba(20, 20, 20, 0.04)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});