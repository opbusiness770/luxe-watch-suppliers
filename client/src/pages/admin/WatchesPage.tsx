import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  apiFetch,
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
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /*
   * Create / edit dialog.
   */
  const [
    watchDialogOpen,
    setWatchDialogOpen,
  ] = useState(false);

  const [
    selectedWatch,
    setSelectedWatch,
  ] =
    useState<
      WatchDetails | null
    >(null);

  /*
   * Watch details dialog.
   */
  const [
    detailsDialogOpen,
    setDetailsDialogOpen,
  ] = useState(false);

  const [
    detailsWatch,
    setDetailsWatch,
  ] =
    useState<
      WatchDetails | null
    >(null);

  const [
    isLoadingDetails,
    setIsLoadingDetails,
  ] = useState(false);

  const [
    imageIndex,
    setImageIndex,
  ] = useState(0);

  /*
   * Stock adjustment dialog.
   */
  const [
    stockWatch,
    setStockWatch,
  ] =
    useState<
      WatchListItem | null
    >(null);

  /*
   * Status change.
   */
  const [
    changingStatusId,
    setChangingStatusId,
  ] =
    useState<
      string | null
    >(null);

  /*
   * Soft-delete dialog.
   */
  const [
    deleteWatchTarget,
    setDeleteWatchTarget,
  ] =
    useState<
      WatchDetails | null
    >(null);

  const [
    deletionReason,
    setDeletionReason,
  ] = useState("");

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  /*
   * Loads the active watch catalog.
   *
   * Soft-deleted watches are already filtered
   * by the backend and therefore do not appear.
   */
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

  /*
   * Search debounce.
   */
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

  /*
   * Opens an empty watch form.
   */
  function handleCreate() {
    setError("");
    setSuccessMessage("");

    setSelectedWatch(
      null,
    );

    setWatchDialogOpen(
      true,
    );
  }

  /*
   * Opens the full details dialog.
   */
  async function handleOpenDetails(
    watchId: string,
  ) {
    setDetailsDialogOpen(
      true,
    );

    setDetailsWatch(
      null,
    );

    setImageIndex(0);

    setIsLoadingDetails(
      true,
    );

    try {
      setError("");
      setSuccessMessage("");

      const response =
        await getWatchById(
          watchId,
        );

      setDetailsWatch(
        response.watch,
      );
    } catch (error) {
      setDetailsDialogOpen(
        false,
      );

      if (
        error instanceof
        HttpError
      ) {
        setError(
          error.message,
        );
      } else {
        setError(
          "לא ניתן לטעון את פרטי השעון",
        );
      }
    } finally {
      setIsLoadingDetails(
        false,
      );
    }
  }

  function handleCloseDetails() {
    if (
      isLoadingDetails
    ) {
      return;
    }

    setDetailsDialogOpen(
      false,
    );

    setDetailsWatch(
      null,
    );

    setImageIndex(0);
  }

  /*
   * Loads complete watch data and opens
   * the edit dialog.
   */
  async function handleEdit(
    watchId: string,
  ) {
    try {
      setError("");
      setSuccessMessage("");

      const response =
        await getWatchById(
          watchId,
        );

      setSelectedWatch(
        response.watch,
      );

      setDetailsDialogOpen(
        false,
      );

      setDetailsWatch(
        null,
      );

      setImageIndex(0);

      setWatchDialogOpen(
        true,
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
          "לא ניתן לטעון את פרטי השעון",
        );
      }
    }
  }

  /*
   * Enables or disables a watch.
   *
   * Disabling is different from deleting.
   * The watch remains in the catalog but
   * cannot participate in new sales.
   */
  async function handleStatusChange(
    watch: {
      id: string;
      isActive: boolean;
    },
  ) {
    try {
      setError("");
      setSuccessMessage("");

      setChangingStatusId(
        watch.id,
      );

      const nextStatus =
        !watch.isActive;

      await setWatchStatus(
        watch.id,
        nextStatus,
      );

      /*
       * Update the currently open details
       * immediately without requiring another
       * network request.
       */
      setDetailsWatch(
        (current) => {
          if (
            !current ||
            current.id !==
              watch.id
          ) {
            return current;
          }

          return {
            ...current,

            isActive:
              nextStatus,
          };
        },
      );

      await loadWatches(
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
          "לא ניתן לעדכן את סטטוס השעון",
        );
      }
    } finally {
      setChangingStatusId(
        null,
      );
    }
  }

  /*
   * Refreshes the catalog after create,
   * edit or stock adjustment.
   */
  function handleSaved() {
    setIsLoading(true);
    setSuccessMessage("");

    void loadWatches(
      search,
    );
  }

  /*
   * Opens the stock dialog from
   * the watch details dialog.
   */
  function handleOpenStockFromDetails() {
    if (!detailsWatch) {
      return;
    }

    const listWatch =
      watches.find(
        (watch) =>
          watch.id ===
          detailsWatch.id,
      );

    if (!listWatch) {
      return;
    }

    setDetailsDialogOpen(
      false,
    );

    setDetailsWatch(
      null,
    );

    setImageIndex(0);

    setStockWatch(
      listWatch,
    );
  }

  /*
   * Opens the soft-delete confirmation dialog.
   */
  function handleOpenDeleteDialog(
    watch: WatchDetails,
  ) {
    setDeleteWatchTarget(
      watch,
    );

    setDeletionReason("");
    setDeleteError("");

    setDetailsDialogOpen(
      false,
    );

    setDetailsWatch(
      null,
    );

    setImageIndex(0);
  }

  function handleCloseDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setDeleteWatchTarget(
      null,
    );

    setDeletionReason("");
    setDeleteError("");
  }

  /*
   * Performs a soft delete.
   *
   * The backend:
   * - marks the watch as deleted
   * - stores the Admin who deleted it
   * - stores the deletion reason
   * - creates a business audit record
   * - keeps historical sales and allocations
   */
  async function handleDeleteWatch() {
    if (
      !deleteWatchTarget
    ) {
      return;
    }

    const normalizedReason =
      deletionReason.trim();

    if (
      normalizedReason.length <
      3
    ) {
      setDeleteError(
        "יש להזין סיבה למחיקה באורך של לפחות 3 תווים",
      );

      return;
    }

    if (
      normalizedReason.length >
      1000
    ) {
      setDeleteError(
        "סיבת המחיקה ארוכה מדי",
      );

      return;
    }

    setDeleteError("");
    setError("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await apiFetch(
        `/api/admin/watches/${deleteWatchTarget.id}`,
        {
          method:
            "DELETE",

          body:
            JSON.stringify({
              deletionReason:
                normalizedReason,
            }),
        },
      );

      const deletedWatchName =
        deleteWatchTarget.name;

      setDeleteWatchTarget(
        null,
      );

      setDeletionReason("");

      setSuccessMessage(
        `השעון "${deletedWatchName}" נמחק מהקטלוג. ההיסטוריה העסקית נשמרה.`,
      );

      setIsLoading(true);

      await loadWatches(
        search,
      );
    } catch (error) {
      if (
        error instanceof
        HttpError
      ) {
        setDeleteError(
          error.message,
        );
      } else {
        setDeleteError(
          "לא ניתן למחוק את השעון",
        );
      }
    } finally {
      setIsDeleting(
        false,
      );
    }
  }

  /*
   * Image gallery for the currently
   * selected watch.
   *
   * Authenticated Cloudinary images must be
   * rendered with the signed delivery URLs
   * generated by the backend.
   *
   * displayImageUrls is preferred.
   * displayImageUrl is the primary fallback.
   * Stored image URLs remain only as a final
   * legacy fallback for older records.
   */
  const detailsImages =
    useMemo(() => {
      if (!detailsWatch) {
        return [];
      }

      if (
        detailsWatch
          .displayImageUrls
          ?.length
      ) {
        return detailsWatch
          .displayImageUrls;
      }

      if (
        detailsWatch
          .displayImageUrl
      ) {
        return [
          detailsWatch
            .displayImageUrl,
        ];
      }

      if (
        detailsWatch
          .imageUrls
          ?.length
      ) {
        return detailsWatch
          .imageUrls;
      }

      if (
        detailsWatch.imageUrl
      ) {
        return [
          detailsWatch.imageUrl,
        ];
      }

      return [];
    }, [
      detailsWatch,
    ]);

  function showPreviousImage() {
    if (
      detailsImages.length <
      2
    ) {
      return;
    }

    setImageIndex(
      (current) =>
        current === 0
          ? detailsImages.length -
            1
          : current - 1,
    );
  }

  function showNextImage() {
    if (
      detailsImages.length <
      2
    ) {
      return;
    }

    setImageIndex(
      (current) =>
        current ===
        detailsImages.length -
          1
          ? 0
          : current + 1,
    );
  }

  return (
    <Box
      sx={{
        width:
          "100%",

        maxWidth:
          1500,

        mx:
          "auto",
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          display:
            "flex",

          flexDirection: {
            xs:
              "column",

            sm:
              "row",
          },

          alignItems: {
            xs:
              "stretch",

            sm:
              "center",
          },

          justifyContent:
            "space-between",

          gap:
            2.5,

          mb: {
            xs:
              3,

            md:
              4,
          },
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              display:
                "block",

              color:
                "primary.main",

              fontWeight:
                700,

              letterSpacing:
                1.7,

              mb:
                0.4,
            }}
          >
            COLLECTION
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight:
                600,

              fontSize: {
                xs:
                  "2rem",

                md:
                  "2.6rem",
              },

              mb:
                0.8,
            }}
          >
            קטלוג השעונים
          </Typography>

          <Typography
            color="text.secondary"
          >
            ניהול דגמי השעונים והמלאי במחסן המרכזי
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={
            handleCreate
          }
          sx={{
            minWidth: {
              sm:
                170,
            },

            minHeight:
              52,
          }}
        >
          הוספת שעון
        </Button>
      </Box>

      {/* Error */}
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

      {/* Success */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
          onClose={() =>
            setSuccessMessage(
              "",
            )
          }
        >
          {successMessage}
        </Alert>
      )}

      {/* Search */}
      <Paper
        sx={{
          p: {
            xs:
              2,

            sm:
              2.5,
          },

          mb:
            3.5,

          borderRadius:
            3,

          bgcolor:
            "rgba(255,255,255,0.82)",

          backdropFilter:
            "blur(12px)",
        }}
      >
        <TextField
          label="חיפוש בקטלוג"
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

      {/* Catalog */}
      {isLoading ? (
        <Paper
          sx={{
            minHeight:
              420,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            borderRadius:
              4,
          }}
        >
          <CircularProgress />
        </Paper>
      ) : watches.length ===
        0 ? (
        <Paper
          sx={{
            p: {
              xs:
                5,

              md:
                8,
            },

            textAlign:
              "center",

            borderRadius:
              4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb:
                1,

              fontWeight:
                600,
            }}
          >
            לא נמצאו שעונים
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb:
                3,
            }}
          >
            נסו לשנות את החיפוש או להוסיף שעון חדש לקטלוג
          </Typography>

          {!search && (
            <Button
              variant="contained"
              onClick={
                handleCreate
              }
            >
              הוספת שעון ראשון
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* Catalog count */}
          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              mb:
                2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {watches.length}{" "}
              שעונים בקטלוג
            </Typography>
          </Box>

          {/* Watch cards */}
          <Box
            sx={{
              display:
                "grid",

              gridTemplateColumns:
                {
                  xs:
                    "repeat(2, minmax(0, 1fr))",

                  sm:
                    "repeat(2, minmax(0, 1fr))",

                  md:
                    "repeat(3, minmax(0, 1fr))",

                  lg:
                    "repeat(4, minmax(0, 1fr))",

                  xl:
                    "repeat(5, minmax(0, 1fr))",
                },

              gap: {
                xs:
                  1.5,

                sm:
                  2.5,

                md:
                  3,
              },
            }}
          >
            {watches.map(
              (watch) => {
                const primaryImage =
                  watch
                    .displayImageUrl ??
                  watch
                    .displayImageUrls
                    ?.[0] ??
                  watch
                    .imageUrls
                    ?.[0] ??
                  watch.imageUrl;

                return (
                  <Card
                    key={
                      watch.id
                    }
                    sx={{
                      position:
                        "relative",

                      aspectRatio:
                        "1 / 1",

                      overflow:
                        "hidden",

                      borderRadius: {
                        xs:
                          2.5,

                        md:
                          3.5,
                      },

                      bgcolor:
                        "#F7F5F0",

                      border:
                        "1px solid rgba(179,145,84,0.17)",

                      boxShadow:
                        "0 10px 35px rgba(57,45,24,0.07)",

                      transition:
                        "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

                      "&:hover":
                        {
                          transform:
                            "translateY(-7px)",

                          borderColor:
                            "rgba(179,145,84,0.42)",

                          boxShadow:
                            "0 24px 65px rgba(57,45,24,0.15)",
                        },
                    }}
                  >
                    <CardActionArea
                      aria-label={`צפייה בפרטי ${watch.name}`}
                      onClick={() =>
                        void handleOpenDetails(
                          watch.id,
                        )
                      }
                      sx={{
                        width:
                          "100%",

                        height:
                          "100%",

                        position:
                          "relative",

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
                          alt={
                            watch.name
                          }
                          sx={{
                            width:
                              "100%",

                            height:
                              "100%",

                            objectFit:
                              "contain",

                            p: {
                              xs:
                                1.4,

                              sm:
                                2,

                              md:
                                2.5,
                            },

                            transition:
                              "transform 420ms ease",

                            ".MuiCard-root:hover &":
                              {
                                transform:
                                  "scale(1.055)",
                              },
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width:
                              "100%",

                            height:
                              "100%",

                            display:
                              "flex",

                            flexDirection:
                              "column",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            background:
                              "radial-gradient(circle, rgba(212,188,138,0.18) 0%, rgba(248,247,244,0.8) 65%)",
                          }}
                        >
                          <Box
                            sx={{
                              width: {
                                xs:
                                  85,

                                md:
                                  120,
                              },

                              height: {
                                xs:
                                  85,

                                md:
                                  120,
                              },

                              borderRadius:
                                "50%",

                              border:
                                "2px solid rgba(179,145,84,0.32)",

                              boxShadow:
                                "inset 0 0 30px rgba(179,145,84,0.13), 0 8px 24px rgba(179,145,84,0.08)",

                              position:
                                "relative",

                              "&::before":
                                {
                                  content:
                                    '""',

                                  position:
                                    "absolute",

                                  width:
                                    2,

                                  height:
                                    "30%",

                                  bgcolor:
                                    "rgba(146,115,63,0.7)",

                                  top:
                                    "22%",

                                  left:
                                    "50%",

                                  transformOrigin:
                                    "bottom",

                                  transform:
                                    "translateX(-50%) rotate(28deg)",
                                },

                              "&::after":
                                {
                                  content:
                                    '""',

                                  position:
                                    "absolute",

                                  width:
                                    2,

                                  height:
                                    "24%",

                                  bgcolor:
                                    "rgba(179,145,84,0.8)",

                                  top:
                                    "28%",

                                  left:
                                    "50%",

                                  transformOrigin:
                                    "bottom",

                                  transform:
                                    "translateX(-50%) rotate(-55deg)",
                                },
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mt:
                                2,
                            }}
                          >
                            אין תמונה
                          </Typography>
                        </Box>
                      )}

                      {/* Hover overlay */}
                      <Box
                        sx={{
                          position:
                            "absolute",

                          inset:
                            0,

                          display:
                            "flex",

                          alignItems:
                            "flex-end",

                          justifyContent:
                            "center",

                          p:
                            2,

                          opacity:
                            0,

                          background:
                            "linear-gradient(180deg, transparent 50%, rgba(32,25,14,0.56) 100%)",

                          transition:
                            "opacity 220ms ease",

                          ".MuiCard-root:hover &":
                            {
                              opacity:
                                1,
                            },
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              "#FFFFFF",

                            fontWeight:
                              700,

                            letterSpacing:
                              0.3,
                          }}
                        >
                          לצפייה בפרטים
                        </Typography>
                      </Box>

                      {/* Inactive status */}
                      {!watch.isActive && (
                        <Chip
                          label="לא פעיל"
                          size="small"
                          sx={{
                            position:
                              "absolute",

                            top:
                              12,

                            right:
                              12,

                            bgcolor:
                              "rgba(255,255,255,0.92)",

                            backdropFilter:
                              "blur(8px)",

                            boxShadow:
                              "0 4px 15px rgba(0,0,0,0.08)",
                          }}
                        />
                      )}
                    </CardActionArea>
                  </Card>
                );
              },
            )}
          </Box>
        </>
      )}

      {/* Watch details dialog */}
      <Dialog
        open={
          detailsDialogOpen
        }
        onClose={
          handleCloseDetails
        }
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              borderRadius: {
                xs:
                  2,

                md:
                  4,
              },

              overflow:
                "hidden",
            },
          },
        }}
      >
        {isLoadingDetails ? (
          <Box
            sx={{
              minHeight:
                520,

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
        ) : detailsWatch ? (
          <>
            <DialogTitle
              sx={{
                px: {
                  xs:
                    2.5,

                  md:
                    4,
                },

                pt: {
                  xs:
                    2.5,

                  md:
                    3,
                },
              }}
            >
              פרטי השעון
            </DialogTitle>

            <DialogContent
              sx={{
                px: {
                  xs:
                    2.5,

                  md:
                    4,
                },

                pb:
                  3,
              }}
            >
              <Box
                sx={{
                  display:
                    "grid",

                  /*
                   * Keeps gallery physically on
                   * the left while the Hebrew
                   * information stays on the right.
                   */
                  direction:
                    "ltr",

                  gridTemplateColumns:
                    {
                      xs:
                        "1fr",

                      md:
                        "minmax(0, 1.12fr) minmax(330px, 0.88fr)",
                    },

                  gap: {
                    xs:
                      3,

                    md:
                      5,
                  },
                }}
              >
                {/* Gallery */}
                <Box
                  sx={{
                    minWidth:
                      0,

                    direction:
                      "rtl",
                  }}
                >
                  <Box
                    sx={{
                      position:
                        "relative",

                      width:
                        "100%",

                      aspectRatio:
                        "1 / 1",

                      overflow:
                        "hidden",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius:
                        3,

                      bgcolor:
                        "#F7F5F0",

                      border:
                        "1px solid rgba(179,145,84,0.18)",
                    }}
                  >
                    {detailsImages.length >
                    0 ? (
                      <Box
                        component="img"
                        src={
                          detailsImages[
                            imageIndex
                          ]
                        }
                        alt={
                          detailsWatch.name
                        }
                        sx={{
                          width:
                            "100%",

                          height:
                            "100%",

                          objectFit:
                            "contain",

                          p: {
                            xs:
                              2,

                            md:
                              3,
                          },
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          textAlign:
                            "center",
                        }}
                      >
                        <Box
                          sx={{
                            width:
                              150,

                            height:
                              150,

                            mx:
                              "auto",

                            borderRadius:
                              "50%",

                            border:
                              "2px solid rgba(179,145,84,0.30)",

                            boxShadow:
                              "inset 0 0 40px rgba(179,145,84,0.12)",
                          }}
                        />

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt:
                              2,
                          }}
                        >
                          עדיין לא נוספו תמונות לשעון
                        </Typography>
                      </Box>
                    )}

                    {/* Previous / Next */}
                    {detailsImages.length >
                      1 && (
                      <>
                        <Button
                          aria-label="תמונה קודמת"
                          onClick={
                            showPreviousImage
                          }
                          sx={{
                            position:
                              "absolute",

                            left:
                              14,

                            top:
                              "50%",

                            transform:
                              "translateY(-50%)",

                            minWidth:
                              46,

                            width:
                              46,

                            height:
                              46,

                            p:
                              0,

                            borderRadius:
                              "50%",

                            bgcolor:
                              "rgba(255,255,255,0.90)",

                            color:
                              "primary.dark",

                            boxShadow:
                              "0 6px 20px rgba(30,22,10,0.12)",

                            "&:hover":
                              {
                                bgcolor:
                                  "#FFFFFF",

                                transform:
                                  "translateY(-50%) scale(1.05)",
                              },
                          }}
                        >
                          ‹
                        </Button>

                        <Button
                          aria-label="תמונה הבאה"
                          onClick={
                            showNextImage
                          }
                          sx={{
                            position:
                              "absolute",

                            right:
                              14,

                            top:
                              "50%",

                            transform:
                              "translateY(-50%)",

                            minWidth:
                              46,

                            width:
                              46,

                            height:
                              46,

                            p:
                              0,

                            borderRadius:
                              "50%",

                            bgcolor:
                              "rgba(255,255,255,0.90)",

                            color:
                              "primary.dark",

                            boxShadow:
                              "0 6px 20px rgba(30,22,10,0.12)",

                            "&:hover":
                              {
                                bgcolor:
                                  "#FFFFFF",

                                transform:
                                  "translateY(-50%) scale(1.05)",
                              },
                          }}
                        >
                          ›
                        </Button>
                      </>
                    )}

                    {detailsImages.length >
                      1 && (
                      <Box
                        sx={{
                          position:
                            "absolute",

                          bottom:
                            14,

                          left:
                            "50%",

                          transform:
                            "translateX(-50%)",

                          px:
                            1.5,

                          py:
                            0.6,

                          borderRadius:
                            20,

                          bgcolor:
                            "rgba(255,255,255,0.88)",

                          backdropFilter:
                            "blur(8px)",

                          fontSize:
                            "0.78rem",

                          color:
                            "text.secondary",
                        }}
                      >
                        {imageIndex +
                          1}{" "}
                        /{" "}
                        {
                          detailsImages.length
                        }
                      </Box>
                    )}
                  </Box>

                  {/* Thumbnail gallery */}
                  {detailsImages.length >
                    1 && (
                    <Box
                      sx={{
                        mt:
                          2,

                        display:
                          "flex",

                        gap:
                          1.2,

                        overflowX:
                          "auto",

                        pb:
                          0.5,

                        direction:
                          "ltr",
                      }}
                    >
                      {detailsImages.map(
                        (
                          image,
                          index,
                        ) => (
                          <Box
                            component="button"
                            type="button"
                            key={`${image}-${index}`}
                            onClick={() =>
                              setImageIndex(
                                index,
                              )
                            }
                            sx={{
                              width:
                                72,

                              height:
                                72,

                              flexShrink:
                                0,

                              p:
                                0.5,

                              borderRadius:
                                2,

                              cursor:
                                "pointer",

                              bgcolor:
                                "#FFFFFF",

                              border:
                                index ===
                                imageIndex
                                  ? "2px solid #B39154"
                                  : "1px solid #E7E4DE",

                              transition:
                                "all 150ms ease",

                              "&:hover":
                                {
                                  borderColor:
                                    "#B39154",
                                },
                            }}
                          >
                            <Box
                              component="img"
                              src={
                                image
                              }
                              alt={`תמונה ${index + 1}`}
                              sx={{
                                width:
                                  "100%",

                                height:
                                  "100%",

                                objectFit:
                                  "contain",
                              }}
                            />
                          </Box>
                        ),
                      )}
                    </Box>
                  )}
                </Box>

                {/* Watch information */}
                <Box
                  sx={{
                    direction:
                      "rtl",

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    justifyContent:
                      "center",

                    minWidth:
                      0,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color:
                        "primary.main",

                      fontWeight:
                        700,

                      letterSpacing:
                        1.8,
                    }}
                  >
                    {
                      detailsWatch.brand
                    }
                  </Typography>

                  <Typography
                    variant="h3"
                    sx={{
                      mt:
                        0.5,

                      fontWeight:
                        600,

                      fontSize: {
                        xs:
                          "2rem",

                        md:
                          "2.55rem",
                      },

                      lineHeight:
                        1.15,
                    }}
                  >
                    {
                      detailsWatch.name
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt:
                        0.8,

                      fontSize:
                        "1rem",
                    }}
                  >
                    {
                      detailsWatch.model
                    }
                  </Typography>

                  <Box
                    sx={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap:
                        1,

                      mt:
                        2.5,
                    }}
                  >
                    <Chip
                      label={
                        detailsWatch.isActive
                          ? "פעיל"
                          : "לא פעיל"
                      }
                      color={
                        detailsWatch.isActive
                          ? "success"
                          : "default"
                      }
                    />

                    <Chip
                      label={`${detailsWatch.warehouseInventory?.quantityOnHand ?? 0} יח׳ במלאי`}
                      variant="outlined"
                    />
                  </Box>

                  {detailsWatch.description && (
                    <Typography
                      sx={{
                        mt:
                          3,

                        color:
                          "text.secondary",

                        lineHeight:
                          1.9,
                      }}
                    >
                      {
                        detailsWatch.description
                      }
                    </Typography>
                  )}

                  <Divider
                    sx={{
                      my:
                        3,
                    }}
                  />

                  {/* Details grid */}
                  <Box
                    sx={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        {
                          xs:
                            "1fr 1fr",
                        },

                      gap:
                        2.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        מלאי נוכחי
                      </Typography>

                      <Typography
                        sx={{
                          mt:
                            0.4,

                          fontWeight:
                            600,
                        }}
                      >
                        {detailsWatch
                          .warehouseInventory
                          ?.quantityOnHand ??
                          0}{" "}
                        יח׳
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        עלות למנהל
                      </Typography>

                      <Typography
                        sx={{
                          mt:
                            0.4,

                          fontWeight:
                            600,
                        }}
                      >
                        {formatCurrency(
                          detailsWatch.adminCostPrice,
                        )}
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
                          mt:
                            0.4,

                          fontWeight:
                            600,
                        }}
                      >
                        {formatCurrency(
                          detailsWatch.defaultSupplierPrice,
                        )}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        סטטוס
                      </Typography>

                      <Typography
                        sx={{
                          mt:
                            0.4,

                          fontWeight:
                            600,
                        }}
                      >
                        {detailsWatch.isActive
                          ? "פעיל"
                          : "לא פעיל"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        gridColumn:
                          "1 / -1",

                        mt:
                          0.5,

                        p:
                          2,

                        borderRadius:
                          2.5,

                        background:
                          "linear-gradient(135deg, rgba(179,145,84,0.08), rgba(212,188,138,0.14))",

                        border:
                          "1px solid rgba(179,145,84,0.16)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        מחיר מכירה מומלץ
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          mt:
                            0.4,

                          color:
                            "primary.dark",

                          fontWeight:
                            700,
                        }}
                      >
                        {formatCurrency(
                          detailsWatch.recommendedSalePrice,
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                px: {
                  xs:
                    2.5,

                  md:
                    4,
                },

                pb:
                  3,

                pt:
                  2,

                gap:
                  1,

                flexWrap:
                  "wrap",
              }}
            >
              <Button
                onClick={
                  handleCloseDetails
                }
              >
                סגירה
              </Button>

              <Button
                variant="outlined"
                onClick={() =>
                  void handleEdit(
                    detailsWatch.id,
                  )
                }
              >
                עריכת פרטים
              </Button>

              <Button
                variant="outlined"
                onClick={
                  handleOpenStockFromDetails
                }
              >
                עדכון מלאי
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() =>
                  handleOpenDeleteDialog(
                    detailsWatch,
                  )
                }
              >
                מחיקת שעון
              </Button>

              <Button
                variant="contained"
                color={
                  detailsWatch.isActive
                    ? "error"
                    : "success"
                }
                disabled={
                  changingStatusId ===
                  detailsWatch.id
                }
                onClick={() =>
                  void handleStatusChange(
                    detailsWatch,
                  )
                }
              >
                {changingStatusId ===
                detailsWatch.id
                  ? "מעדכן..."
                  : detailsWatch.isActive
                    ? "השבתת שעון"
                    : "הפעלת שעון"}
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      {/* Delete watch dialog */}
      <Dialog
        open={
          deleteWatchTarget !==
          null
        }
        onClose={
          isDeleting
            ? undefined
            : handleCloseDeleteDialog
        }
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius:
                3,
            },
          },
        }}
      >
        <DialogTitle>
          מחיקת שעון מהקטלוג
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              pt:
                1,
            }}
          >
            {deleteError && (
              <Alert
                severity="error"
                sx={{
                  mb:
                    2,
                }}
              >
                {deleteError}
              </Alert>
            )}

            <Alert
              severity="warning"
              sx={{
                mb:
                  3,
              }}
            >
              השעון יוסר מהקטלוג ולא יהיה ניתן להקצות או למכור אותו בעסקאות חדשות. מכירות, הקצאות והיסטוריה עסקית קיימות יישמרו.
            </Alert>

            {deleteWatchTarget && (
              <Paper
                variant="outlined"
                sx={{
                  p:
                    2,

                  mb:
                    3,

                  borderRadius:
                    2.5,

                  bgcolor:
                    "rgba(179,145,84,0.035)",
                }}
              >
                <Typography
                  variant="overline"
                  color="primary.main"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {
                    deleteWatchTarget.brand
                  }
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {
                    deleteWatchTarget.name
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {
                    deleteWatchTarget.model
                  }
                </Typography>
              </Paper>
            )}

            <TextField
              label="סיבת המחיקה"
              value={
                deletionReason
              }
              onChange={(
                event,
              ) => {
                setDeletionReason(
                  event.target
                    .value,
                );

                setDeleteError(
                  "",
                );
              }}
              placeholder="לדוגמה: הדגם אינו משווק יותר"
              helperText={`${deletionReason.trim().length}/1000 תווים. הסיבה תישמר בהיסטוריה העסקית`}
              multiline
              minRows={4}
              required
              fullWidth
              disabled={
                isDeleting
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    1000,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px:
              3,

            pb:
              3,

            gap:
              1,
          }}
        >
          <Button
            onClick={
              handleCloseDeleteDialog
            }
            disabled={
              isDeleting
            }
          >
            ביטול
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() =>
              void handleDeleteWatch()
            }
            disabled={
              isDeleting ||
              deletionReason
                .trim()
                .length <
                3
            }
          >
            {isDeleting
              ? "מוחק..."
              : "מחיקת השעון"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit dialog */}
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

      {/* Stock adjustment dialog */}
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