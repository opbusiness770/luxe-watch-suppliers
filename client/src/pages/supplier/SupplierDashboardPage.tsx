import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import {
  HttpError,
} from "../../api/http";

import {
  getSupplierDashboard,
} from "../../api/supplierDashboard";

import StatCard from "../../components/dashboard/StatCard";

import type {
  SupplierDashboardResponse,
} from "../../types/supplierDashboard";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

export default function SupplierDashboardPage() {
  const navigate =
    useNavigate();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<SupplierDashboardResponse | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadDashboard() {
      try {
        setError("");

        const response =
          await getSupplierDashboard(
            controller.signal,
          );

        setDashboard(
          response,
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        if (
          error instanceof HttpError
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            "לא ניתן לטעון את לוח הבקרה",
          );
        }
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setIsLoading(
            false,
          );
        }
      }
    }

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 400,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    error ||
    !dashboard
  ) {
    return (
      <Alert severity="error">
        {error ||
          "לא ניתן לטעון את לוח הבקרה"}
      </Alert>
    );
  }

  const {
    summary,
    recentSales,
  } = dashboard;

  return (
    <Box
      sx={{
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",

          flexDirection: {
            xs: "column",
            md: "row",
          },

          alignItems: {
            xs: "stretch",
            md: "center",
          },

          justifyContent:
            "space-between",

          gap: 2,

          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 0.75,
            }}
          >
            לוח הבקרה שלי
          </Typography>

          <Typography
            color="text.secondary"
          >
            תמונת מצב עדכנית של המלאי והמכירות שלך
          </Typography>
        </Box>

        <Button
          variant="contained"

          onClick={() =>
            navigate(
              "/supplier/new-sale",
            )
          }
        >
          דיווח מכירה חדשה
        </Button>
      </Box>

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm: "repeat(2, minmax(0, 1fr))",

            lg: "repeat(3, minmax(0, 1fr))",

            xl: "repeat(5, minmax(0, 1fr))",
          },

          gap: 2,

          mb: 4,
        }}
      >
        <StatCard
          title="יחידות במלאי"
          value={
            summary.inventoryUnits
          }
          subtitle="סך כל השעונים הזמינים אצלך"
        />

        <StatCard
          title="דגמים שהוקצו"
          value={
            summary.totalModels
          }
          subtitle="כל הדגמים שהוקצו לך"
        />

        <StatCard
          title="דגמים זמינים"
          value={
            summary.availableModels
          }
          subtitle="דגמים שיש מהם מלאי כרגע"
        />

        <StatCard
          title="מכירות החודש"
          value={
            summary.monthlySales
          }
          subtitle="עסקאות שהושלמו החודש"
        />

        <StatCard
          title="הכנסות החודש"
          value={formatCurrency(
            summary.monthlyRevenue,
          )}
          subtitle="סך המכירות שהושלמו החודש"
        />
      </Box>

      {/* Quick actions */}
      <Paper
        sx={{
          p: {
            xs: 2,
            md: 3,
          },

          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          פעולות מהירות
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2.5,
          }}
        >
          גישה מהירה לפעולות המרכזיות בפורטל
        </Typography>

        <Box
          sx={{
            display: "flex",

            flexWrap: "wrap",

            gap: 1.5,
          }}
        >
          <Button
            variant="contained"

            onClick={() =>
              navigate(
                "/supplier/new-sale",
              )
            }
          >
            דיווח מכירה
          </Button>

          <Button
            variant="outlined"

            onClick={() =>
              navigate(
                "/supplier/inventory",
              )
            }
          >
            המלאי שלי
          </Button>

          <Button
            variant="outlined"

            onClick={() =>
              navigate(
                "/supplier/sales",
              )
            }
          >
            היסטוריית מכירות
          </Button>
        </Box>
      </Paper>

      {/* Recent sales */}
      <Paper
        sx={{
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,

            display: "flex",

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            justifyContent:
              "space-between",

            alignItems: {
              xs: "stretch",
              sm: "center",
            },

            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              מכירות אחרונות
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              חמש המכירות האחרונות שלך
            </Typography>
          </Box>

          <Button
            size="small"

            onClick={() =>
              navigate(
                "/supplier/sales",
              )
            }
          >
            לכל המכירות
          </Button>
        </Box>

        <Divider />

        {recentSales.length ===
        0 ? (
          <Box
            sx={{
              p: 6,

              textAlign:
                "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
              }}
            >
              עדיין לא דווחו מכירות
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              המכירות האחרונות שלך יופיעו כאן
            </Typography>

            <Button
              variant="contained"

              onClick={() =>
                navigate(
                  "/supplier/new-sale",
                )
              }
            >
              דיווח מכירה ראשונה
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table
              sx={{
                minWidth: 800,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    תאריך
                  </TableCell>

                  <TableCell>
                    שעונים
                  </TableCell>

                  <TableCell>
                    דגמים
                  </TableCell>

                  <TableCell>
                    יחידות
                  </TableCell>

                  <TableCell>
                    סכום
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentSales.map(
                  (sale) => {
                    const totalUnits =
                      sale.items.reduce(
                        (
                          sum,
                          item,
                        ) =>
                          sum +
                          item.quantity,
                        0,
                      );

                    const watchNames =
                      sale.items
                        .map(
                          (item) =>
                            item.watch.name?.trim() ||
                            `${item.watch.brand} ${item.watch.model}`,
                        )
                        .join(", ");

                    return (
                      <TableRow
                        key={
                          sale.id
                        }
                        hover
                      >
                        <TableCell>
                          {formatDateTime(
                            sale.soldAt,
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight:
                                500,

                              maxWidth:
                                320,

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",
                            }}
                            title={
                              watchNames
                            }
                          >
                            {
                              watchNames
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {
                            sale.items
                              .length
                          }
                        </TableCell>

                        <TableCell>
                          {
                            totalUnits
                          }
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                "primary.dark",

                              fontWeight:
                                600,
                            }}
                          >
                            {formatCurrency(
                              sale.totalAmount,
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}