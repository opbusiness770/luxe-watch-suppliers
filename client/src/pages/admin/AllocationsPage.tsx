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
  }, [
    loadData,
  ]);

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

      <Paper
        sx={{
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              md: 3,
            },

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
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs:
                  "1fr",

                sm:
                  "repeat(2, minmax(0, 1fr))",

                lg:
                  "repeat(3, minmax(0, 1fr))",
              },

              gap: 2.5,

              px: {
                xs: 2,
                md: 3,
              },

              pb: 3,
            }}
          >
            {allocations.map(
              (
                allocation,
              ) => {
                const primaryImage =
                  allocation.watch
                    .displayImageUrl ??
                  allocation.watch
                    .displayImageUrls?.[0] ??
                  allocation.watch
                    .imageUrls?.[0] ??
                  allocation.watch
                    .imageUrl;

                return (
                  <Paper
                    key={
                      allocation.id
                    }
                    variant="outlined"
                    sx={{
                      overflow:
                        "hidden",

                      borderRadius:
                        3,

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      minWidth:
                        0,

                      bgcolor:
                        "background.paper",

                      transition:
                        "transform 180ms ease, box-shadow 180ms ease",

                      "&:hover": {
                        transform:
                          "translateY(-3px)",

                        boxShadow:
                          4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",

                        aspectRatio:
                          "4 / 3",

                        bgcolor:
                          "background.default",

                        borderBottom:
                          "1px solid",

                        borderColor:
                          "divider",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        overflow:
                          "hidden",
                      }}
                    >
                      {primaryImage ? (
                        <Box
                          component="img"
                          src={
                            primaryImage
                          }
                          alt={`${allocation.watch.brand} ${allocation.watch.model}`}
                          loading="lazy"
                          sx={{
                            width:
                              "100%",

                            height:
                              "100%",

                            objectFit:
                              "contain",

                            p: 1.5,
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          אין תמונה
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        p: 2.25,

                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap: 2,

                        flexGrow:
                          1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight:
                              700,

                            lineHeight:
                              1.3,
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
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          {
                            allocation
                              .watch
                              .name
                          }
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display:
                            "grid",

                          gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",

                          gap: 1.5,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            ספק
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              allocation
                                .supplier
                                .contactName
                            }
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            כמות
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              allocation.quantity
                            }{" "}
                            יח׳
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            מחיר לספק
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            {formatCurrency(
                              allocation.supplierCostPrice,
                            )}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            מחיר מינימלי
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight:
                                700,

                              color:
                                "primary.dark",
                            }}
                          >
                            {formatCurrency(
                              allocation.requiredSalePrice,
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          pt: 1.5,

                          borderTop:
                            "1px solid",

                          borderColor:
                            "divider",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          תאריך הקצאה
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.25,
                          }}
                        >
                          {formatDateTime(
                            allocation.createdAt,
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          הערות
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.25,

                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {
                            allocation.notes ||
                            "—"
                          }
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              },
            )}
          </Box>
        )}
      </Paper>

      <AllocationDialog
        open={
          dialogOpen
        }
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
