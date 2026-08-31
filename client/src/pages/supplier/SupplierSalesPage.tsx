import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

import {
  HttpError,
} from "../../api/http";

import {
  getSupplierSaleById,
  getSupplierSales,
} from "../../api/supplierSales";

import SupplierSaleDetailsDialog from "../../components/sales/SupplierSaleDetailsDialog";

import type {
  SupplierSaleDetails,
  SupplierSaleListItem,
} from "../../types/supplierSale";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

export default function SupplierSalesPage() {
  const [
    sales,
    setSales,
  ] = useState<
    SupplierSaleListItem[]
  >([]);

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(20);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isLoadingDetails,
    setIsLoadingDetails,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedSale,
    setSelectedSale,
  ] =
    useState<SupplierSaleDetails | null>(
      null,
    );

  const loadSales =
    useCallback(
      async (
        currentPage: number,
        currentLimit: number,
        signal?: AbortSignal,
      ) => {
        try {
          setError("");

          const response =
            await getSupplierSales(
              currentPage + 1,
              currentLimit,
              signal,
            );

          setSales(
            response.sales,
          );

          setTotal(
            response.pagination.total,
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
            error instanceof
            HttpError
          ) {
            setError(
              error.message,
            );
          } else {
            setError(
              "לא ניתן לטעון את היסטוריית המכירות",
            );
          }
        } finally {
          if (
            !signal?.aborted
          ) {
            setIsLoading(
              false,
            );
          }
        }
      },
      [],
    );

  useEffect(() => {
    const controller =
      new AbortController();

    setIsLoading(true);

    void loadSales(
      page,
      rowsPerPage,
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [
    page,
    rowsPerPage,
    loadSales,
  ]);

  async function handleViewSale(
    saleId: string,
  ) {
    try {
      setError("");

      setIsLoadingDetails(
        true,
      );

      const response =
        await getSupplierSaleById(
          saleId,
        );

      setSelectedSale(
        response.sale,
      );
    } catch (error) {
      if (
        error instanceof
        HttpError
      ) {
        setError(
          error.message,
        );
      } else {
        setError(
          "לא ניתן לטעון את פרטי המכירה",
        );
      }
    } finally {
      setIsLoadingDetails(
        false,
      );
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 0.75,
          }}
        >
          היסטוריית מכירות
        </Typography>

        <Typography
          color="text.secondary"
        >
          כל המכירות שדווחו דרך המערכת
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

      <Paper
        sx={{
          overflow:
            "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            המכירות שלי
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            סה״כ {total} מכירות
          </Typography>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              minHeight: 320,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : sales.length ===
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
            >
              לאחר שתדווחי על מכירה היא תופיע כאן
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 850,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      תאריך
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

                    <TableCell>
                      סטטוס
                    </TableCell>

                    <TableCell>
                      פעולות
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sales.map(
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
                            {
                              sale.items
                                .length
                            }
                          </TableCell>

                          <TableCell>
                            {totalUnits}
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight:
                                  600,

                                color:
                                  "primary.dark",
                              }}
                            >
                              {formatCurrency(
                                sale.totalAmount,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                sale.status ===
                                "COMPLETED"
                                  ? "הושלמה"
                                  : "בוטלה"
                              }
                              color={
                                sale.status ===
                                "COMPLETED"
                                  ? "success"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Button
                              size="small"
                              disabled={
                                isLoadingDetails
                              }
                              onClick={() =>
                                void handleViewSale(
                                  sale.id,
                                )
                              }
                            >
                              פרטים
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={
                rowsPerPage
              }
              rowsPerPageOptions={[
                10,
                20,
                50,
              ]}
              onPageChange={(
                _event,
                newPage,
              ) =>
                setPage(
                  newPage,
                )
              }
              onRowsPerPageChange={(
                event,
              ) => {
                setRowsPerPage(
                  Number(
                    event.target
                      .value,
                  ),
                );

                setPage(0);
              }}
              labelRowsPerPage="שורות בעמוד:"
              labelDisplayedRows={({
                from,
                to,
                count,
              }) =>
                `${from}-${to} מתוך ${count}`
              }
            />
          </>
        )}
      </Paper>

      <SupplierSaleDetailsDialog
        open={
          selectedSale !==
          null
        }
        sale={
          selectedSale
        }
        onClose={() =>
          setSelectedSale(
            null,
          )
        }
      />
    </Box>
  );
}