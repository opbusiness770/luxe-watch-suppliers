import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
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
  getAdminDashboard,
} from "../../api/dashboard";

import StatCard from "../../components/dashboard/StatCard";

import type {
  AdminDashboardResponse,
} from "../../types/dashboard";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

export default function AdminDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<
      AdminDashboardResponse | null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadDashboard() {
      try {
        setError("");

        const response =
          await getAdminDashboard(
            controller.signal,
          );

        setDashboard(
          response,
        );
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setError(
          "לא ניתן לטעון את נתוני לוח הבקרה",
        );
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
          minHeight:
            400,

          display:
            "flex",

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
      <Alert
        severity="error"
      >
        {error ||
          "לא ניתן לטעון את לוח הבקרה"}
      </Alert>
    );
  }

  const {
    summary,
    recentSales,
    topSuppliers,
  } = dashboard;

  return (
    <Box
      sx={{
        maxWidth:
          1500,

        mx:
          "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb:
            4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight:
              600,

            mb:
              0.75,
          }}
        >
          לוח בקרה
        </Typography>

        <Typography
          color="text.secondary"
        >
          תמונת מצב עדכנית של הפעילות העסקית
        </Typography>
      </Box>

      {/* Summary cards */}
      <Box
        sx={{
          display:
            "grid",

          gridTemplateColumns: {
            xs:
              "1fr",

            sm:
              "repeat(2, minmax(0, 1fr))",

            lg:
              "repeat(3, minmax(0, 1fr))",

            xl:
              "repeat(5, minmax(0, 1fr))",
          },

          gap:
            2,

          mb:
            4,
        }}
      >
        <StatCard
          title="ספקים פעילים"
          value={
            summary.activeSuppliers
          }
          subtitle="ספקים בעלי גישה פעילה למערכת"
        />

        <StatCard
          title="דגמי שעונים פעילים"
          value={
            summary.activeWatches
          }
          subtitle="דגמים זמינים בקטלוג"
        />

        <StatCard
          title="יחידות במחסן"
          value={
            summary.warehouseUnits
          }
          subtitle="מלאי נוכחי במחסן המרכזי"
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
          value={
            formatCurrency(
              summary.monthlyRevenue,
            )
          }
          subtitle="סך המכירות שהושלמו"
        />
      </Box>

      {/* Main dashboard content */}
      <Box
        sx={{
          display:
            "grid",

          gridTemplateColumns: {
            xs:
              "1fr",

            lg:
              "minmax(0, 1.5fr) minmax(300px, 0.8fr)",
          },

          gap:
            3,

          alignItems:
            "start",
        }}
      >
        {/* Recent sales */}
        <Paper
          sx={{
            overflow:
              "hidden",
          }}
        >
          <Box
            sx={{
              px:
                3,

              py:
                2.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  600,
              }}
            >
              מכירות אחרונות
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt:
                  0.5,
              }}
            >
              חמש המכירות האחרונות במערכת
            </Typography>
          </Box>

          <Divider />

          {recentSales.length ===
          0 ? (
            <Box
              sx={{
                p:
                  4,

                textAlign:
                  "center",
              }}
            >
              <Typography
                color="text.secondary"
              >
                עדיין לא נרשמו מכירות
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      ספק
                    </TableCell>

                    <TableCell>
                      תאריך
                    </TableCell>

                    <TableCell>
                      סכום
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentSales.map(
                    (
                      sale,
                    ) => (
                      <TableRow
                        key={
                          sale.id
                        }
                        hover
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                500,
                            }}
                          >
                            {
                              sale
                                .supplier
                                .contactName
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {formatDateTime(
                            sale.soldAt,
                          )}
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
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Top suppliers */}
        <Paper>
          <Box
            sx={{
              px:
                3,

              py:
                2.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  600,
              }}
            >
              ספקים מובילים
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt:
                  0.5,
              }}
            >
              לפי הכנסות החודש
            </Typography>
          </Box>

          <Divider />

          {topSuppliers.length ===
          0 ? (
            <Box
              sx={{
                p:
                  4,

                textAlign:
                  "center",
              }}
            >
              <Typography
                color="text.secondary"
              >
                אין עדיין נתוני מכירות
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                p:
                  3,
              }}
            >
              {topSuppliers.map(
                (
                  supplier,
                  index,
                ) => (
                  <Box
                    key={
                      supplier.supplierId
                    }
                  >
                    <Box
                      sx={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",

                        gap:
                          2,

                        py:
                          1.75,
                      }}
                    >
                      <Box
                        sx={{
                          minWidth:
                            0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight:
                              600,
                          }}
                        >
                          {index + 1}.{" "}
                          {
                            supplier.contactName
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            supplier.salesCount
                          }{" "}
                          מכירות
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight:
                            600,

                          color:
                            "primary.dark",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatCurrency(
                          supplier.revenue,
                        )}
                      </Typography>
                    </Box>

                    {index <
                      topSuppliers.length -
                        1 && (
                      <Divider />
                    )}
                  </Box>
                ),
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}