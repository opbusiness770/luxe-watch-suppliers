import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import {
  HttpError,
} from "../../api/http";

import {
  getSupplierInventory,
} from "../../api/supplierInventory";

import {
  createSupplierSale,
} from "../../api/supplierSales";

import type {
  SupplierInventoryItem,
} from "../../types/supplierInventory";

import {
  formatCurrency,
} from "../../utils/formatters";

type SaleFormItem = {
  id: number;

  watchId: string;

  quantity: string;

  salePrice: string;
};

let nextItemId = 1;

function createEmptyItem(): SaleFormItem {
  return {
    id: nextItemId++,

    watchId: "",

    quantity: "1",

    salePrice: "",
  };
}

function hasAtMostTwoDecimals(
  value: string,
): boolean {
  return /^\d+(\.\d{1,2})?$/.test(
    value,
  );
}

export default function NewSalePage() {
  const navigate =
    useNavigate();

  const [
    inventory,
    setInventory,
  ] = useState<
    SupplierInventoryItem[]
  >([]);

  const [
    items,
    setItems,
  ] = useState<
    SaleFormItem[]
  >([
    createEmptyItem(),
  ]);

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadInventory() {
      try {
        setError("");

        const response =
          await getSupplierInventory(
            "",
            controller.signal,
          );

        setInventory(
          response.items.filter(
            (item) =>
              item.quantityOnHand > 0,
          ),
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
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
            "לא ניתן לטעון את המלאי",
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoading(false);
        }
      }
    }

    void loadInventory();

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * חשוב:
   * המפתח הוא watch.id ולא watchId ברמה העליונה.
   */
  const inventoryMap =
    useMemo(() => {
      return new Map(
        inventory.map(
          (item) => [
            item.watch.id,
            item,
          ],
        ),
      );
    }, [inventory]);

  const totalAmount =
    useMemo(() => {
      return items.reduce(
        (
          sum,
          item,
        ) => {
          const quantity =
            Number(
              item.quantity,
            );

          const price =
            Number(
              item.salePrice,
            );

          if (
            !Number.isFinite(
              quantity,
            ) ||
            !Number.isFinite(
              price,
            )
          ) {
            return sum;
          }

          return (
            sum +
            quantity * price
          );
        },
        0,
      );
    }, [items]);

  const totalUnits =
    useMemo(() => {
      return items.reduce(
        (
          sum,
          item,
        ) => {
          const quantity =
            Number(
              item.quantity,
            );

          if (
            !Number.isInteger(
              quantity,
            ) ||
            quantity <= 0
          ) {
            return sum;
          }

          return (
            sum +
            quantity
          );
        },
        0,
      );
    }, [items]);

  function updateItem(
    itemId: number,
    changes:
      Partial<SaleFormItem>,
  ) {
    setError("");

    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id === itemId
              ? {
                  ...item,
                  ...changes,
                }
              : item,
        ),
    );
  }

  function handleWatchChange(
    itemId: number,
    watchId: string,
  ) {
    setError("");

    const inventoryItem =
      inventoryMap.get(
        watchId,
      );

    updateItem(
      itemId,
      {
        watchId,

        quantity: "1",

        salePrice:
          inventoryItem
            ? String(
                inventoryItem.requiredSalePrice,
              )
            : "",
      },
    );
  }

  function addItem() {
    setError("");

    setItems(
      (current) => [
        ...current,
        createEmptyItem(),
      ],
    );
  }

  function removeItem(
    itemId: number,
  ) {
    setError("");

    setItems(
      (current) => {
        if (
          current.length === 1
        ) {
          return current;
        }

        return current.filter(
          (item) =>
            item.id !== itemId,
        );
      },
    );
  }

  async function handleSubmit() {
    setError("");

    if (
      items.length === 0
    ) {
      setError(
        "יש להוסיף לפחות שעון אחד למכירה",
      );

      return;
    }

    const usedWatchIds =
      new Set<string>();

    const preparedItems: Array<{
      watchId: string;
      quantity: number;
      salePrice: number;
    }> = [];

    for (
      const item of items
    ) {
      if (!item.watchId) {
        setError(
          "יש לבחור שעון בכל שורת מכירה",
        );

        return;
      }

      if (
        usedWatchIds.has(
          item.watchId,
        )
      ) {
        setError(
          "לא ניתן להוסיף את אותו שעון פעמיים לאותה מכירה",
        );

        return;
      }

      usedWatchIds.add(
        item.watchId,
      );

      const inventoryItem =
        inventoryMap.get(
          item.watchId,
        );

      if (!inventoryItem) {
        setError(
          "אחד מהשעונים אינו קיים במלאי שלך",
        );

        return;
      }

      const parsedQuantity =
        Number(
          item.quantity,
        );

      if (
        !Number.isInteger(
          parsedQuantity,
        ) ||
        parsedQuantity <= 0
      ) {
        setError(
          "הכמות חייבת להיות מספר שלם וחיובי",
        );

        return;
      }

      if (
        parsedQuantity >
        inventoryItem.quantityOnHand
      ) {
        setError(
          `אין מספיק מלאי עבור ${inventoryItem.watch.brand} ${inventoryItem.watch.model}`,
        );

        return;
      }

      if (
        !item.salePrice ||
        !hasAtMostTwoDecimals(
          item.salePrice,
        )
      ) {
        setError(
          "יש להזין מחיר מכירה תקין עם עד שתי ספרות אחרי הנקודה",
        );

        return;
      }

      const parsedSalePrice =
        Number(
          item.salePrice,
        );

      if (
        !Number.isFinite(
          parsedSalePrice,
        ) ||
        parsedSalePrice < 0
      ) {
        setError(
          "מחיר המכירה אינו תקין",
        );

        return;
      }

      const minimumPrice =
        Number(
          inventoryItem.requiredSalePrice,
        );

      if (
        parsedSalePrice <
        minimumPrice
      ) {
        setError(
          `מחיר המכירה של ${inventoryItem.watch.brand} ${inventoryItem.watch.model} לא יכול להיות נמוך מ-${formatCurrency(
            inventoryItem.requiredSalePrice,
          )}`,
        );

        return;
      }

      preparedItems.push({
        watchId:
          item.watchId,

        quantity:
          parsedQuantity,

        salePrice:
          parsedSalePrice,
      });
    }

    setIsSaving(true);

    try {
      await createSupplierSale({
        items:
          preparedItems,

        notes:
          notes.trim() ||
          undefined,
      });

      navigate(
        "/supplier/sales",
        {
          replace: true,
        },
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
          "לא ניתן לדווח את המכירה",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

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

  return (
    <Box
      sx={{
        maxWidth: 1100,
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
          דיווח מכירה
        </Typography>

        <Typography
          color="text.secondary"
        >
          הזנת שעונים שנמכרו ועדכון המלאי
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

      {inventory.length ===
      0 ? (
        <Paper
          sx={{
            p: 5,

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
            אין כרגע מלאי זמין למכירה
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            יש לקבל הקצאת מלאי מהמנהל לפני שניתן לדווח על מכירה
          </Typography>

          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                "/supplier/inventory",
              )
            }
          >
            מעבר למלאי שלי
          </Button>
        </Paper>
      ) : (
        <>
          {/* Sale items */}
          <Paper
            sx={{
              p: {
                xs: 2,
                md: 3,
              },

              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              פריטי המכירה
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              ניתן לדווח מספר דגמי שעונים באותה מכירה
            </Typography>

            <Stack
              spacing={3}
            >
              {items.map(
                (
                  item,
                  index,
                ) => {
                  const selectedInventory =
                    inventoryMap.get(
                      item.watchId,
                    );

                  return (
                    <Box
                      key={
                        item.id
                      }
                    >
                      {index >
                        0 && (
                        <Divider
                          sx={{
                            mb: 3,
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "space-between",

                          gap: 2,

                          mb: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight:
                              600,
                          }}
                        >
                          שעון{" "}
                          {index +
                            1}
                        </Typography>

                        {items.length >
                          1 && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              removeItem(
                                item.id,
                              )
                            }
                          >
                            הסרה
                          </Button>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display:
                            "grid",

                          gridTemplateColumns: {
                            xs: "1fr",

                            md: "minmax(0, 2fr) minmax(120px, 0.7fr) minmax(160px, 1fr)",
                          },

                          gap: 2,
                        }}
                      >
                        {/* Watch */}
                        <Autocomplete
                          options={
                            inventory
                          }
                          value={
                            selectedInventory ??
                            null
                          }
                          onChange={(
                            _event,
                            newValue,
                          ) => {
                            handleWatchChange(
                              item.id,

                              newValue
                                ?.watch.id ??
                                "",
                            );
                          }}
                          isOptionEqualToValue={(
                            option,
                            value,
                          ) =>
                            option.watch.id ===
                            value.watch.id
                          }
                          getOptionLabel={(
                            option,
                          ) => {
                            const displayName =
                              option.watch.name?.trim() ||
                              `${option.watch.brand} ${option.watch.model}`;

                            return `${displayName} — ${option.quantityOnHand} יח׳`;
                          }}
                          getOptionDisabled={(
                            option,
                          ) =>
                            items.some(
                              (
                                other,
                              ) =>
                                other.id !==
                                  item.id &&
                                other.watchId ===
                                  option.watch.id,
                            )
                          }
                          noOptionsText="לא נמצאו שעונים"
                          renderInput={(
                            params,
                          ) => (
                            <TextField
                              {...params}

                              label="שעון"

                              placeholder="בחר שעון"

                              required

                              fullWidth
                            />
                          )}
                        />

                        {/* Quantity */}
                        <TextField
                          label="כמות"
                          type="number"

                          value={
                            item.quantity
                          }

                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              item.id,
                              {
                                quantity:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }

                          slotProps={{
                            htmlInput:
                              {
                                min: 1,

                                step: 1,

                                max:
                                  selectedInventory
                                    ?.quantityOnHand,
                              },
                          }}

                          required
                          fullWidth
                        />

                        {/* Sale price */}
                        <TextField
                          label="מחיר מכירה ליחידה"
                          type="number"

                          value={
                            item.salePrice
                          }

                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              item.id,
                              {
                                salePrice:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }

                          slotProps={{
                            htmlInput:
                              {
                                min:
                                  selectedInventory
                                    ? Number(
                                        selectedInventory.requiredSalePrice,
                                      )
                                    : 0,

                                step:
                                  0.01,
                              },
                          }}

                          required
                          fullWidth
                        />
                      </Box>

                      {/* Selected watch information */}
                      {selectedInventory && (
                        <Box
                          sx={{
                            mt: 2,

                            p: 2,

                            borderRadius:
                              2,

                            bgcolor:
                              "background.default",

                            display:
                              "flex",

                            flexWrap:
                              "wrap",

                            gap: 3,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            מלאי זמין:{" "}
                            <strong>
                              {
                                selectedInventory.quantityOnHand
                              }{" "}
                              יח׳
                            </strong>
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            המחיר שלך:{" "}
                            <strong>
                              {formatCurrency(
                                selectedInventory.supplierCostPrice,
                              )}
                            </strong>
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            מחיר מינימלי:{" "}
                            <strong>
                              {formatCurrency(
                                selectedInventory.requiredSalePrice,
                              )}
                            </strong>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                },
              )}
            </Stack>

            <Button
              variant="outlined"

              onClick={
                addItem
              }

              disabled={
                items.length >=
                inventory.length
              }

              sx={{
                mt: 3,
              }}
            >
              הוספת שעון למכירה
            </Button>
          </Paper>

          {/* Sale information */}
          <Paper
            sx={{
              p: {
                xs: 2,
                md: 3,
              },

              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              פרטי המכירה
            </Typography>

            <TextField
              label="הערות"

              value={notes}

              onChange={(
                event,
              ) => {
                setError("");

                setNotes(
                  event.target.value,
                );
              }}

              placeholder="הערה אופציונלית לגבי המכירה"

              multiline
              minRows={3}

              fullWidth
            />
          </Paper>

          {/* Summary */}
          <Paper
            sx={{
              p: 3,

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

              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                סיכום מכירה
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                }}
              >
                {totalUnits}{" "}
                יחידות
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 0.5,

                  fontWeight:
                    600,

                  color:
                    "primary.dark",
                }}
              >
                {formatCurrency(
                  totalAmount,
                )}
              </Typography>
            </Box>

            <Button
              variant="contained"

              size="large"

              onClick={
                handleSubmit
              }

              disabled={
                isSaving
              }
            >
              {isSaving
                ? "שומר מכירה..."
                : "אישור ודיווח מכירה"}
            </Button>
          </Paper>
        </>
      )}
    </Box>
  );
}