import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
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
  getSupplierInventory,
} from "../../api/supplierInventory";

import type {
  SupplierInventoryItem,
} from "../../types/supplierInventory";

import {
  formatCurrency,
} from "../../utils/formatters";

export default function SupplierInventoryPage() {
  const [
    inventory,
    setInventory,
  ] =
    useState<
      SupplierInventoryItem[]
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
    totalModels,
    setTotalModels,
  ] = useState(0);

  /*
   * Loads the inventory allocated to
   * the currently authenticated supplier.
   */
  const loadInventory =
    useCallback(
      async (
        currentSearch: string,
        signal?: AbortSignal,
      ) => {
        try {
          setError("");

          const response =
            await getSupplierInventory(
              currentSearch,
              signal,
            );

          setInventory(
            response.items,
          );

          setTotalModels(
            response.pagination
              .total,
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
              "לא ניתן לטעון את המלאי",
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
   * Debounced inventory search.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        () => {
          void loadInventory(
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
    loadInventory,
  ]);

  /*
   * Total units currently held by
   * the supplier.
   */
  const totalUnits =
    useMemo(
      () =>
        inventory.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            item.quantityOnHand,
          0,
        ),
      [
        inventory,
      ],
    );

  /*
   * Models that can currently be sold.
   *
   * A model must have stock and must
   * still be active in the catalog.
   */
  const availableModels =
    useMemo(
      () =>
        inventory.filter(
          (item) =>
            item.quantityOnHand >
              0 &&
            item.watch.isActive,
        ).length,
      [
        inventory,
      ],
    );

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
          המלאי שלי
        </Typography>

        <Typography
          color="text.secondary"
        >
          צפייה בשעונים שהוקצו לך ובמחירי המכירה שלהם
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

      {/* Summary */}
      {!isLoading && (
        <Box
          sx={{
            display:
              "grid",

            gridTemplateColumns: {
              xs:
                "1fr",

              sm:
                "repeat(3, minmax(0, 1fr))",
            },

            gap:
              2,

            mb:
              3,
          }}
        >
          <Paper
            sx={{
              p:
                2.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              דגמים שהוקצו
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt:
                  1,

                fontWeight:
                  600,

                color:
                  "primary.dark",
              }}
            >
              {totalModels}
            </Typography>
          </Paper>

          <Paper
            sx={{
              p:
                2.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              דגמים זמינים כרגע
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt:
                  1,

                fontWeight:
                  600,

                color:
                  "primary.dark",
              }}
            >
              {availableModels}
            </Typography>
          </Paper>

          <Paper
            sx={{
              p:
                2.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              יחידות במלאי
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt:
                  1,

                fontWeight:
                  600,

                color:
                  "primary.dark",
              }}
            >
              {totalUnits}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Search */}
      <Paper
        sx={{
          p:
            2.5,

          mb:
            3,
        }}
      >
        <TextField
          label="חיפוש במלאי"
          placeholder="חיפוש לפי מותג, דגם או שם השעון"
          value={search}
          onChange={(
            event,
          ) =>
            setSearch(
              event.target
                .value,
            )
          }
          fullWidth
        />
      </Paper>

      {/* Inventory */}
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
            השעונים שלי
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt:
                0.5,
            }}
          >
            המחירים והכמויות המוצגים הם הנתונים העדכניים במערכת
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
        ) : inventory.length ===
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
              אין שעונים במלאי
            </Typography>

            <Typography
              color="text.secondary"
            >
              {search
                ? "לא נמצאו שעונים התואמים לחיפוש"
                : "עדיין לא הוקצה לך מלאי על ידי המנהל"}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table
              sx={{
                minWidth:
                  800,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    שעון
                  </TableCell>

                  <TableCell>
                    מלאי נוכחי
                  </TableCell>

                  <TableCell>
                    המחיר שלי
                  </TableCell>

                  <TableCell>
                    מחיר מכירה מינימלי
                  </TableCell>

                  <TableCell>
                    זמינות
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {inventory.map(
                  (
                    item,
                  ) => {
                    const primaryImage =
                      item.watch
                        .displayImageUrl ??
                      item.watch
                        .displayImageUrls
                        ?.[0] ??
                      item.watch
                        .imageUrls
                        ?.[0] ??
                      item.watch
                        .imageUrl;

                    const isAvailable =
                      item.quantityOnHand >
                        0 &&
                      item.watch
                        .isActive;

                    return (
                      <TableRow
                        key={
                          item.watch.id
                        }
                        hover
                      >
                        {/* Watch */}
                        <TableCell>
                          <Box
                            sx={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                2,

                              minWidth:
                                240,
                            }}
                          >
                            {primaryImage ? (
                              <Box
                                component="img"
                                src={
                                  primaryImage
                                }
                                alt={
                                  item.watch
                                    .name
                                }
                                sx={{
                                  width:
                                    64,

                                  height:
                                    64,

                                  flexShrink:
                                    0,

                                  objectFit:
                                    "contain",

                                  bgcolor:
                                    "#FFFFFF",

                                  border:
                                    "1px solid",

                                  borderColor:
                                    "divider",

                                  borderRadius:
                                    2,
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width:
                                    64,

                                  height:
                                    64,

                                  flexShrink:
                                    0,

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

                                  bgcolor:
                                    "background.default",

                                  border:
                                    "1px solid",

                                  borderColor:
                                    "divider",

                                  borderRadius:
                                    2,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    textAlign:
                                      "center",
                                  }}
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
                                  item.watch
                                    .name
                                }
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {
                                  item.watch
                                    .brand
                                }{" "}
                                {
                                  item.watch
                                    .model
                                }
                              </Typography>

                              {!item.watch
                                .isActive && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  הדגם אינו פעיל כרגע
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Quantity */}
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              item.quantityOnHand
                            }{" "}
                            יח׳
                          </Typography>
                        </TableCell>

                        {/* Supplier cost */}
                        <TableCell>
                          {formatCurrency(
                            item.supplierCostPrice,
                          )}
                        </TableCell>

                        {/* Required selling price */}
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
                              item.requiredSalePrice,
                            )}
                          </Typography>
                        </TableCell>

                        {/* Availability */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              !item.watch
                                .isActive
                                ? "לא פעיל"
                                : item.quantityOnHand >
                                    0
                                  ? "במלאי"
                                  : "אזל מהמלאי"
                            }
                            color={
                              isAvailable
                                ? "success"
                                : "default"
                            }
                            variant={
                              isAvailable
                                ? "filled"
                                : "outlined"
                            }
                          />
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