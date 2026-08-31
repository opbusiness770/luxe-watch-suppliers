import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  HttpError,
} from "../../api/http";

import {
  getAllocations,
} from "../../api/allocations";

import {
  getSuppliers,
} from "../../api/suppliers";

import {
  getWatches,
} from "../../api/watches";

import AllocationDialog from "../../components/allocations/AllocationDialog";

import type {
  AllocationListItem,
} from "../../types/allocation";

import type {
  SupplierListItem,
} from "../../types/supplier";

import type {
  WatchListItem,
} from "../../types/watch";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

export default function AllocationsPage() {
  const [
    allocations,
    setAllocations,
  ] = useState<
    AllocationListItem[]
  >([]);

  const [
    suppliers,
    setSuppliers,
  ] = useState<
    SupplierListItem[]
  >([]);

  const [
    watches,
    setWatches,
  ] = useState<
    WatchListItem[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const loadData =
    useCallback(
      async (
        signal?: AbortSignal,
      ) => {
        try {
          setError("");

          const [
            allocationsResponse,
            suppliersResponse,
            watchesResponse,
          ] =
            await Promise.all([
              getAllocations(
                signal,
              ),

              getSuppliers(
                "",
                signal,
              ),

              getWatches(
                "",
                signal,
              ),
            ]);

          setAllocations(
            allocationsResponse.allocations,
          );

          setSuppliers(
            suppliersResponse.suppliers.filter(
              (supplier) =>
                supplier.user
                  .isActive,
            ),
          );

          setWatches(
            watchesResponse.watches.filter(
              (watch) =>
                watch.isActive,
            ),
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
              "לא ניתן לטעון את נתוני ההקצאות",
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

    void loadData(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadData]);

  function handleSaved() {
    setIsLoading(true);

    void loadData();
  }

  return (
    <Box
      sx={{
        maxWidth: 1600,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",

          flexDirection: {
            xs: "column",
            sm: "row",
          },

          alignItems: {
            xs: "stretch",
            sm: "center",
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
            הקצאות מלאי
          </Typography>

          <Typography
            color="text.secondary"
          >
            העברת שעונים מהמחסן המרכזי למלאי הספקים
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() =>
            setDialogOpen(
              true,
            )
          }
        >
          הקצאה חדשה
        </Button>
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

      {/* Helpful summary */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          ספקים פעילים:{" "}
          <strong>
            {suppliers.length}
          </strong>
          {" · "}
          דגמי שעונים פעילים:{" "}
          <strong>
            {watches.length}
          </strong>
        </Typography>
      </Paper>

      {/* Allocation history */}
      <Paper
        sx={{
          overflow: "hidden",
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
            היסטוריית הקצאות
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            ההקצאות שבוצעו לספקים
          </Typography>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              minHeight: 300,

              display: "flex",
              alignItems:
                "center",

              justifyContent:
                "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : allocations.length ===
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
              עדיין לא בוצעו הקצאות
            </Typography>

            <Typography
              color="text.secondary"
            >
              לחצו על "הקצאה חדשה" כדי להעביר מלאי לספק
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table
              sx={{
                minWidth: 1000,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    ספק
                  </TableCell>

                  <TableCell>
                    שעון
                  </TableCell>

                  <TableCell>
                    כמות
                  </TableCell>

                  <TableCell>
                    מחיר לספק
                  </TableCell>

                  <TableCell>
                    מחיר מינימלי
                  </TableCell>

                  <TableCell>
                    תאריך
                  </TableCell>

                  <TableCell>
                    הערות
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {allocations.map(
                  (allocation) => (
                    <TableRow
                      key={
                        allocation.id
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
                            allocation
                              .supplier
                              .companyName
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight:
                              500,
                          }}
                        >
                          {
                            allocation
                              .watch
                              .brand
                          }{" "}
                          {
                            allocation
                              .watch
                              .model
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            allocation
                              .watch
                              .sku
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {
                          allocation.quantity
                        }{" "}
                        יח׳
                      </TableCell>

                      <TableCell>
                        {formatCurrency(
                          allocation.supplierCostPrice,
                        )}
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
                            allocation.requiredSalePrice,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {formatDateTime(
                          allocation.createdAt,
                        )}
                      </TableCell>

                      <TableCell>
                        {allocation.notes ||
                          "—"}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <AllocationDialog
        open={dialogOpen}
        suppliers={
          suppliers
        }
        watches={
          watches
        }
        onClose={() =>
          setDialogOpen(
            false,
          )
        }
        onSaved={
          handleSaved
        }
      />
    </Box>
  );
}