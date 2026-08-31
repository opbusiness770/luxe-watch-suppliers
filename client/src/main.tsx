import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  CacheProvider,
} from "@emotion/react";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import {
  rtlCache,
} from "./theme/rtlCache";

import {
  theme,
} from "./theme/theme";

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>,
);