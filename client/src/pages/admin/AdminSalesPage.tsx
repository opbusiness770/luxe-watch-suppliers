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
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  HttpError,
} from "../../api/http";

import {
  getAdminSaleById,
  getAdminSales,
} from "../../api/adminSales";

import {
  getSuppliers,
} from "../../api/suppliers";

import AdminSaleDetailsDialog from "../../components/sales/AdminSaleDetailsDialog";

import type {
  AdminSaleDetails,
  AdminSaleListItem,
  SaleStatus,
} from "../../types/adminSale";

import type {
  SupplierListItem,
} from "../../types/supplier";

import {
  endOfLocalDayIso,
  formatCurrency,
  formatDateTime,
  startOfLocalDayIso,
} from "../../utils/formatters";

type AppliedFilters = {
  supplierId: string;

  status:
    | SaleStatus
    | "";

  from: string;

  to: string;
};

const emptyFilters: AppliedFilters = {
  supplierId: "",
  status: "",
  from: "",
  to: "",
};

export default function AdminSalesPage() {
  const [
    sales,
    setSales,
  ] =
    useState<
      AdminSaleListItem[]
    >([]);

  const [
    suppliers,
    setSuppliers,
  ] =
    useState<
      SupplierListItem[]
    >([]);

  const [
    filters,
    setFilters,
  ] =
    useState<AppliedFilters>(
      emptyFilters,
    );

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<AppliedFilters>(
      emptyFilters,
    );

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
    error,
    setError,
  ] = useState("");

  const [
    selectedSale,
    setSelectedSale,
  ] =
    useState<
      AdminSaleDetails | null
    >(null);

  const [
    isLoadingDetails,
    setIsLoadingDetails,
  ] = useState(false);

  /*
   * Loads sales according to the currently
   * applied filters and pagination.
   */
  const loadSales =
    useCallback(
      async (
        currentPage: number,
        currentLimit: number,
        currentFilters:
          AppliedFilters,
        signal?: AbortSignal,
      ) => {
        try {
          setError("");

          const response =
            await getAdminSales(
              {
                page:
                  currentPage +
                  1,

                limit:
                  currentLimit,

                supplierId:
                  currentFilters
                    .supplierId ||
                  undefined,

                status:
                  currentFilters
                    .status,

                from:
                  currentFilters
                    .from
                    ? startOfLocalDayIso(
                        currentFilters.from,
                      )
                    : undefined,

                to:
                  currentFilters
                    .to
                    ? endOfLocalDayIso(
                        currentFilters.to,
                      )
                    : undefined,
              },
              signal,
            );

          setSales(
            response.sales,
          );

          setTotal(
            response.pagination
              ?.total ??
              response.sales
                .length,
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

          if (
            error instanceof
            HttpError
          ) {
            setError(
              error.message,
            );
          } else {
            setError(
              "לא ניתן לטעון את המכירות",
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

  /*
   * Reload sales whenever pagination
   * or applied filters change.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    setIsLoading(true);

    void loadSales(
      page,
      rowsPerPage,
      appliedFilters,
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [
    page,
    rowsPerPage,
    appliedFilters,
    loadSales,
  ]);

  /*
   * Loads suppliers for the filter selector.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    async function loadSuppliers() {
      try {
        const response =
          await getSuppliers(
            "",
            controller.signal,
          );

        setSuppliers(
          response.suppliers,
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
      }
    }

    void loadSuppliers();

    return () => {
      controller.abort();
    };
  }, []);

  function handleApplyFilters() {
    if (
      filters.from &&
      filters.to &&
      filters.from >
        filters.to
    ) {
      setError(
        "תאריך ההתחלה לא יכול להיות מאוחר מתאריך הסיום",
      );

      return;
    }

    setError("");
    setPage(0);

    setAppliedFilters({
      ...filters,
    });
  }

  function handleClearFilters() {
    setFilters({
      ...emptyFilters,
    });

    setAppliedFilters({
      ...emptyFilters,
    });

    setPage(0);
  }

  /*
   * Loads the full sale record before opening
   * the sale details dialog.
   */
  async function handleViewSale(
    saleId: string,
  ) {
    try {
      setError("");

      setIsLoadingDetails(
        true,
      );

      const response =
        await getAdminSaleById(
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
        maxWidth:
          1600,

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
          מכירות
        </Typography>

        <Typography
          color="text.secondary"
        >
          צפייה ומעקב אחר המכירות שדווחו על ידי הספקים
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb:
              3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper
        sx={{
          p:
            2.5,

          mb:
            3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb:
              2,

            fontWeight:
              600,
          }}
        >
          סינון מכירות
        </Typography>

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
                "repeat(4, minmax(0, 1fr))",
            },

            gap:
              2,
          }}
        >
          <TextField
            select
            label="ספק"
            value={
              filters.supplierId
            }
            onChange={(event) =>
              setFilters(
                (
                  current,
                ) => ({
                  ...current,

                  supplierId:
                    event.target
                      .value,
                }),
              )
            }
            fullWidth
          >
            <MenuItem value="">
              כל הספקים
            </MenuItem>

            {suppliers.map(
              (supplier) => (
                <MenuItem
                  key={
                    supplier.id
                  }
                  value={
                    supplier.id
                  }
                >
                  {
                    supplier.contactName
                  }
                </MenuItem>
              ),
            )}
          </TextField>

          <TextField
            select
            label="סטטוס"
            value={
              filters.status
            }
            onChange={(event) =>
              setFilters(
                (
                  current,
                ) => ({
                  ...current,

                  status:
                    event.target
                      .value as
                      | SaleStatus
                      | "",
                }),
              )
            }
            fullWidth
          >
            <MenuItem value="">
              כל הסטטוסים
            </MenuItem>

            <MenuItem value="COMPLETED">
              הושלמה
            </MenuItem>

            <MenuItem value="CANCELLED">
              בוטלה
            </MenuItem>
          </TextField>

          <TextField
            label="מתאריך"
            type="date"
            value={
              filters.from
            }
            onChange={(event) =>
              setFilters(
                (
                  current,
                ) => ({
                  ...current,

                  from:
                    event.target
                      .value,
                }),
              )
            }
            slotProps={{
              inputLabel: {
                shrink:
                  true,
              },
            }}
            fullWidth
          />

          <TextField
            label="עד תאריך"
            type="date"
            value={
              filters.to
            }
            onChange={(event) =>
              setFilters(
                (
                  current,
                ) => ({
                  ...current,

                  to:
                    event.target
                      .value,
                }),
              )
            }
            slotProps={{
              inputLabel: {
                shrink:
                  true,
              },
            }}
            fullWidth
          />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt:
              2,

            flexWrap:
              "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={
              handleApplyFilters
            }
          >
            החלת סינון
          </Button>

          <Button
            variant="outlined"
            onClick={
              handleClearFilters
            }
          >
            ניקוי
          </Button>
        </Stack>
      </Paper>

      {/* Sales table */}
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
            רשימת מכירות
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt:
                0.5,
            }}
          >
            סה״כ נמצאו{" "}
            {total} מכירות
          </Typography>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              minHeight:
                320,

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
        ) : sales.length ===
          0 ? (
          <Box
            sx={{
              p:
                6,

              textAlign:
                "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb:
                  1,
              }}
            >
              לא נמצאו מכירות
            </Typography>

            <Typography
              color="text.secondary"
            >
              עדיין לא דווחו מכירות התואמות לסינון שנבחר
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth:
                    1000,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      ספק
                    </TableCell>

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
                    (
                      sale,
                    ) => {
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
                            <Typography
                              sx={{
                                fontWeight:
                                  600,
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
                              variant={
                                sale.status ===
                                "COMPLETED"
                                  ? "filled"
                                  : "outlined"
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

      <AdminSaleDetailsDialog
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