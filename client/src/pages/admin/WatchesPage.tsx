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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  HttpError,
} from "../../api/http";

import {
  getWatchById,
  getWatches,
  setWatchStatus,
} from "../../api/watches";

import StockAdjustmentDialog from "../../components/watches/StockAdjustmentDialog";
import WatchDialog from "../../components/watches/WatchDialog";

import type {
  WatchDetails,
  WatchListItem,
} from "../../types/watch";

import {
  formatCurrency,
} from "../../utils/formatters";

export default function WatchesPage() {
  const [
    watches,
    setWatches,
  ] = useState<
    WatchListItem[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    watchDialogOpen,
    setWatchDialogOpen,
  ] = useState(false);

  const [
    selectedWatch,
    setSelectedWatch,
  ] =
    useState<WatchDetails | null>(
      null,
    );

  const [
    stockWatch,
    setStockWatch,
  ] =
    useState<WatchListItem | null>(
      null,
    );

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
    useState<string | null>(
      null,
    );

  const loadWatches =
    useCallback(
      async (
        currentSearch: string,
        signal?: AbortSignal,
      ) => {
        try {
          setError("");

          const response =
            await getWatches(
              currentSearch,
              signal,
            );

          setWatches(
            response.watches,
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
              "לא ניתן לטעון את רשימת השעונים",
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

    const timer =
      window.setTimeout(
        () => {
          void loadWatches(
            search,
            controller.signal,
          );
        },
        300,
      );

    return () => {
      window.clearTimeout(
        timer,
      );

      controller.abort();
    };
  }, [
    search,
    loadWatches,
  ]);

  function handleCreate() {
    setSelectedWatch(null);

    setWatchDialogOpen(
      true,
    );
  }

  async function handleEdit(
    watchId: string,
  ) {
    try {
      setError("");

      const response =
        await getWatchById(
          watchId,
        );

      setSelectedWatch(
        response.watch,
      );

      setWatchDialogOpen(
        true,
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
          "לא ניתן לטעון את פרטי השעון",
        );
      }
    }
  }

  async function handleStatusChange(
    watch: WatchListItem,
  ) {
    try {
      setError("");

      setChangingStatusId(
        watch.id,
      );

      await setWatchStatus(
        watch.id,
        !watch.isActive,
      );

      await loadWatches(
        search,
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
          "לא ניתן לעדכן את סטטוס השעון",
        );
      }
    } finally {
      setChangingStatusId(
        null,
      );
    }
  }

  function handleSaved() {
    setIsLoading(true);

    void loadWatches(
      search,
    );
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
            ניהול שעונים
          </Typography>

          <Typography
            color="text.secondary"
          >
            קטלוג השעונים והמלאי במחסן המרכזי
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={
            handleCreate
          }
        >
          הוספת שעון
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

      {/* Search */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
        }}
      >
        <TextField
          label="חיפוש שעון"
          placeholder="חיפוש לפי מותג, דגם, שם או מק״ט"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          fullWidth
        />
      </Paper>

      {/* Watches */}
      <Paper
        sx={{
          overflow:
            "hidden",
        }}
      >
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
        ) : watches.length ===
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
              לא נמצאו שעונים
            </Typography>

            <Typography
              color="text.secondary"
            >
              נסו לשנות את החיפוש או להוסיף שעון חדש
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table
              sx={{
                minWidth: 1100,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    שעון
                  </TableCell>

                  <TableCell>
                    מק״ט
                  </TableCell>

                  <TableCell>
                    עלות
                  </TableCell>

                  <TableCell>
                    מחיר לספק
                  </TableCell>

                  <TableCell>
                    מחיר מומלץ
                  </TableCell>

                  <TableCell>
                    מלאי
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
                {watches.map(
                  (watch) => {
                    const quantity =
                      watch
                        .warehouseInventory
                        ?.quantityOnHand ??
                      0;

                    return (
                      <TableRow
                        key={
                          watch.id
                        }
                        hover
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap: 2,

                              minWidth:
                                220,
                            }}
                          >
                            {watch.imageUrl ? (
                              <Box
                                component="img"
                                src={
                                  watch.imageUrl
                                }
                                alt={
                                  watch.name
                                }
                                sx={{
                                  width: 58,
                                  height: 58,

                                  objectFit:
                                    "contain",

                                  border:
                                    "1px solid",

                                  borderColor:
                                    "divider",

                                  borderRadius:
                                    2,

                                  bgcolor:
                                    "#FFFFFF",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 58,
                                  height: 58,

                                  flexShrink:
                                    0,

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

                                  border:
                                    "1px solid",

                                  borderColor:
                                    "divider",

                                  borderRadius:
                                    2,

                                  bgcolor:
                                    "background.default",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  אין תמונה
                                </Typography>
                              </Box>
                            )}

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
                                {
                                  watch.name
                                }
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {
                                  watch.brand
                                }{" "}
                                {
                                  watch.model
                                }
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          {
                            watch.sku
                          }
                        </TableCell>

                        <TableCell>
                          {formatCurrency(
                            watch.adminCostPrice,
                          )}
                        </TableCell>

                        <TableCell>
                          {formatCurrency(
                            watch.defaultSupplierPrice,
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
                              watch.recommendedSalePrice,
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={`${quantity} יח׳`}
                            size="small"
                            variant="outlined"
                            color={
                              quantity ===
                              0
                                ? "error"
                                : "default"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              watch.isActive
                                ? "פעיל"
                                : "לא פעיל"
                            }
                            color={
                              watch.isActive
                                ? "success"
                                : "default"
                            }
                            variant={
                              watch.isActive
                                ? "filled"
                                : "outlined"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <Button
                              size="small"
                              onClick={() =>
                                void handleEdit(
                                  watch.id,
                                )
                              }
                            >
                              עריכה
                            </Button>

                            <Button
                              size="small"
                              onClick={() =>
                                setStockWatch(
                                  watch,
                                )
                              }
                            >
                              עדכון מלאי
                            </Button>

                            <Button
                              size="small"
                              color={
                                watch.isActive
                                  ? "error"
                                  : "success"
                              }
                              disabled={
                                changingStatusId ===
                                watch.id
                              }
                              onClick={() =>
                                void handleStatusChange(
                                  watch,
                                )
                              }
                            >
                              {changingStatusId ===
                              watch.id
                                ? "מעדכן..."
                                : watch.isActive
                                  ? "השבתה"
                                  : "הפעלה"}
                            </Button>
                          </Stack>
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

      {/* Create / Edit */}
      <WatchDialog
        open={
          watchDialogOpen
        }
        watch={
          selectedWatch
        }
        onClose={() => {
          setWatchDialogOpen(
            false,
          );

          setSelectedWatch(
            null,
          );
        }}
        onSaved={
          handleSaved
        }
      />

      {/* Stock */}
      <StockAdjustmentDialog
        open={
          stockWatch !==
          null
        }
        watchId={
          stockWatch?.id ??
          null
        }
        watchName={
          stockWatch
            ? `${stockWatch.brand} ${stockWatch.model}`
            : ""
        }
        currentQuantity={
          stockWatch
            ?.warehouseInventory
            ?.quantityOnHand ??
          0
        }
        onClose={() =>
          setStockWatch(
            null,
          )
        }
        onSaved={
          handleSaved
        }
      />
    </Box>
  );
}