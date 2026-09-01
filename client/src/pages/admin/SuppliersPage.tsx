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
  getSupplierById,
  getSuppliers,
  setSupplierStatus,
} from "../../api/suppliers";

import ResetPasswordDialog from "../../components/suppliers/ResetPasswordDialog";
import SupplierDialog from "../../components/suppliers/SupplierDialog";

import type {
  SupplierDetails,
  SupplierListItem,
} from "../../types/supplier";

export default function SuppliersPage() {
  const [
    suppliers,
    setSuppliers,
  ] =
    useState<
      SupplierListItem[]
    >([]);

  const [
    search,
    setSearch,
  ] =
    useState("");

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

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] =
    useState<
      SupplierDetails | null
    >(null);

  const [
    resetPasswordSupplier,
    setResetPasswordSupplier,
  ] =
    useState<
      SupplierListItem | null
    >(null);

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
    useState<
      string | null
    >(null);

  /*
   * Loads the suppliers list.
   *
   * The backend supports searching by:
   * - Contact name
   * - Username
   * - Email
   */
  const loadSuppliers =
    useCallback(
      async (
        currentSearch: string,
        signal?: AbortSignal,
      ) => {
        try {
          setError("");

          const response =
            await getSuppliers(
              currentSearch,
              signal,
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

          setError(
            "לא ניתן לטעון את רשימת הספקים",
          );
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
   * Debounced supplier search.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        () => {
          void loadSuppliers(
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
    loadSuppliers,
  ]);

  /*
   * Loads full supplier details before
   * opening the edit dialog.
   */
  async function handleEdit(
    supplierId: string,
  ) {
    try {
      setError("");

      const response =
        await getSupplierById(
          supplierId,
        );

      setSelectedSupplier(
        response.supplier,
      );

      setDialogOpen(true);
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
          "לא ניתן לטעון את פרטי הספק",
        );
      }
    }
  }

  /*
   * Opens an empty dialog for
   * creating a new supplier.
   */
  function handleCreate() {
    setSelectedSupplier(
      null,
    );

    setDialogOpen(true);
  }

  /*
   * Enables or blocks a supplier account.
   */
  async function handleStatusChange(
    supplier:
      SupplierListItem,
  ) {
    try {
      setChangingStatusId(
        supplier.id,
      );

      setError("");

      await setSupplierStatus(
        supplier.id,
        !supplier.user
          .isActive,
      );

      await loadSuppliers(
        search,
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
          "לא ניתן לעדכן את מצב הספק",
        );
      }
    } finally {
      setChangingStatusId(
        null,
      );
    }
  }

  /*
   * Reload supplier data after
   * creating or editing a supplier.
   */
  function handleSaved() {
    setIsLoading(true);

    void loadSuppliers(
      search,
    );
  }

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
          display:
            "flex",

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
            ניהול ספקים
          </Typography>

          <Typography
            color="text.secondary"
          >
            יצירה, עריכה וניהול משתמשי הספקים
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={
            handleCreate
          }
        >
          הוספת ספק
        </Button>
      </Box>

      {/* Error message */}
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
          label="חיפוש ספק"
          placeholder="חיפוש לפי איש קשר, שם משתמש או אימייל"
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

      {/* Suppliers table */}
      <Paper
        sx={{
          overflow:
            "hidden",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              minHeight: 300,

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
        ) : suppliers.length ===
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
              לא נמצאו ספקים
            </Typography>

            <Typography
              color="text.secondary"
            >
              נסו לשנות את החיפוש או להוסיף ספק חדש
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    איש קשר
                  </TableCell>

                  <TableCell>
                    שם משתמש
                  </TableCell>

                  <TableCell>
                    אימייל
                  </TableCell>

                  <TableCell>
                    טלפון
                  </TableCell>

                  <TableCell>
                    שעונים
                  </TableCell>

                  <TableCell>
                    מכירות
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
                {suppliers.map(
                  (
                    supplier,
                  ) => (
                    <TableRow
                      key={
                        supplier.id
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
                            supplier.contactName
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {
                          supplier.user
                            .username
                        }
                      </TableCell>

                      <TableCell>
                        {supplier.user
                          .email ||
                          "לא הוזן"}
                      </TableCell>

                      <TableCell>
                        {supplier.phone ||
                          "לא הוזן"}
                      </TableCell>

                      <TableCell>
                        {
                          supplier
                            ._count
                            .inventories
                        }
                      </TableCell>

                      <TableCell>
                        {
                          supplier
                            ._count
                            .sales
                        }
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            supplier
                              .user
                              .isActive
                              ? "פעיל"
                              : "חסום"
                          }
                          variant={
                            supplier
                              .user
                              .isActive
                              ? "filled"
                              : "outlined"
                          }
                          color={
                            supplier
                              .user
                              .isActive
                              ? "success"
                              : "default"
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
                                supplier.id,
                              )
                            }
                          >
                            עריכה
                          </Button>

                          <Button
                            size="small"
                            onClick={() =>
                              setResetPasswordSupplier(
                                supplier,
                              )
                            }
                          >
                            איפוס סיסמה
                          </Button>

                          <Button
                            size="small"
                            color={
                              supplier
                                .user
                                .isActive
                                ? "error"
                                : "success"
                            }
                            disabled={
                              changingStatusId ===
                              supplier.id
                            }
                            onClick={() =>
                              void handleStatusChange(
                                supplier,
                              )
                            }
                          >
                            {changingStatusId ===
                            supplier.id
                              ? "מעדכן..."
                              : supplier
                                    .user
                                    .isActive
                                ? "חסימה"
                                : "הפעלה"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create / Edit supplier dialog */}
      <SupplierDialog
        open={dialogOpen}
        supplier={
          selectedSupplier
        }
        onClose={() => {
          setDialogOpen(
            false,
          );

          setSelectedSupplier(
            null,
          );
        }}
        onSaved={
          handleSaved
        }
      />

      {/* Reset password dialog */}
      <ResetPasswordDialog
        open={
          resetPasswordSupplier !==
          null
        }
        supplierId={
          resetPasswordSupplier
            ?.id ?? null
        }
        supplierName={
          resetPasswordSupplier
            ?.contactName ??
          ""
        }
        onClose={() =>
          setResetPasswordSupplier(
            null,
          )
        }
      />
    </Box>
  );
}