import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";

import type {
  WatchListItem,
} from "../../types/watch";

import {
  formatCurrency,
} from "../../utils/formatters";

type WatchDetailsDialogProps = {
  open: boolean;

  watch:
    | WatchListItem
    | null;

  isChangingStatus: boolean;

  onClose: () => void;

  onEdit: (
    watchId: string,
  ) => void;

  onStock: (
    watch: WatchListItem,
  ) => void;

  onToggleStatus: (
    watch: WatchListItem,
  ) => void;
};

/*
 * Returns the complete watch image gallery.
 *
 * imageUrls is the preferred source.
 * imageUrl remains as a fallback for older watches.
 */
function getImages(
  watch: WatchListItem,
): string[] {
  if (
    watch.imageUrls?.length
  ) {
    return watch.imageUrls;
  }

  if (watch.imageUrl) {
    return [
      watch.imageUrl,
    ];
  }

  return [];
}

export default function WatchDetailsDialog({
  open,
  watch,
  isChangingStatus,
  onClose,
  onEdit,
  onStock,
  onToggleStatus,
}: WatchDetailsDialogProps) {
  const [
    imageIndex,
    setImageIndex,
  ] =
    useState(0);

  /*
   * Always return to the first image when
   * opening another watch.
   */
  useEffect(() => {
    setImageIndex(0);
  }, [
    watch?.id,
    open,
  ]);

  if (!watch) {
    return null;
  }

  const images =
    getImages(watch);

  const quantity =
    watch
      .warehouseInventory
      ?.quantityOnHand ??
    0;

  function previousImage() {
    if (
      images.length <= 1
    ) {
      return;
    }

    setImageIndex(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1,
    );
  }

  function nextImage() {
    if (
      images.length <= 1
    ) {
      return;
    }

    setImageIndex(
      (current) =>
        current ===
        images.length - 1
          ? 0
          : current + 1,
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        {watch.name}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display:
              "grid",

            gridTemplateColumns: {
              xs: "1fr",

              md:
                "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
            },

            gap: {
              xs: 3,
              md: 5,
            },
          }}
        >
          {/* Gallery */}
          <Box>
            <Box
              sx={{
                position:
                  "relative",

                aspectRatio:
                  "1 / 1",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                overflow:
                  "hidden",

                borderRadius: 4,

                bgcolor:
                  "#F8F7F4",

                border:
                  "1px solid",

                borderColor:
                  "divider",
              }}
            >
              {images.length >
              0 ? (
                <Box
                  component="img"
                  src={
                    images[
                      imageIndex
                    ]
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

                    p: 3,
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
                      width: 130,
                      height: 130,

                      mx: "auto",
                      mb: 2,

                      borderRadius:
                        "50%",

                      border:
                        "2px solid rgba(179,145,84,0.35)",

                      boxShadow:
                        "inset 0 0 30px rgba(179,145,84,0.12)",
                    }}
                  />

                  <Typography
                    color="text.secondary"
                  >
                    עדיין לא נוספו תמונות
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Gallery navigation */}
            {images.length >
              1 && (
              <Box
                sx={{
                  mt: 2,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={
                    previousImage
                  }
                >
                  הקודם
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {imageIndex +
                    1}{" "}
                  מתוך{" "}
                  {
                    images.length
                  }
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={
                    nextImage
                  }
                >
                  הבא
                </Button>
              </Box>
            )}
          </Box>

          {/* Watch information */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                color:
                  "primary.main",

                letterSpacing:
                  1.5,

                fontWeight:
                  700,
              }}
            >
              {watch.brand}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,

                fontWeight:
                  600,
              }}
            >
              {watch.name}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
                mb: 2,
              }}
            >
              {watch.model}
            </Typography>

            {/* Status */}
            <Box
              sx={{
                display:
                  "flex",

                gap: 1,

                flexWrap:
                  "wrap",

                mb: 3,
              }}
            >
              <Chip
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
              />

              <Chip
                label={`${quantity} יח׳ במלאי`}
                variant="outlined"
              />
            </Box>

            {/* Description */}
            {watch.description && (
              <Typography
                sx={{
                  mb: 3,

                  lineHeight:
                    1.8,
                }}
              >
                {
                  watch.description
                }
              </Typography>
            )}

            <Divider
              sx={{
                my: 3,
              }}
            />

            {/* Inventory and prices */}
            <Box
              sx={{
                display:
                  "grid",

                gridTemplateColumns: {
                  xs: "1fr",

                  sm:
                    "1fr 1fr",
                },

                gap: 2.5,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  מלאי במחסן
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,

                    fontWeight:
                      600,
                  }}
                >
                  {quantity} יח׳
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
                    mt: 0.4,

                    fontWeight:
                      600,
                  }}
                >
                  {formatCurrency(
                    watch.adminCostPrice,
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
                    mt: 0.4,

                    fontWeight:
                      600,
                  }}
                >
                  {formatCurrency(
                    watch.defaultSupplierPrice,
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  מחיר מכירה מומלץ
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 0.4,

                    color:
                      "primary.dark",

                    fontWeight:
                      700,
                  }}
                >
                  {formatCurrency(
                    watch.recommendedSalePrice,
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,

          gap: 1,

          flexWrap:
            "wrap",
        }}
      >
        <Button
          onClick={
            onClose
          }
        >
          סגירה
        </Button>

        <Button
          variant="outlined"
          onClick={() =>
            onEdit(
              watch.id,
            )
          }
        >
          עריכת פרטים
        </Button>

        <Button
          variant="outlined"
          onClick={() =>
            onStock(
              watch,
            )
          }
        >
          עדכון מלאי
        </Button>

        <Button
          variant="contained"
          color={
            watch.isActive
              ? "error"
              : "success"
          }
          disabled={
            isChangingStatus
          }
          onClick={() =>
            onToggleStatus(
              watch,
            )
          }
        >
          {isChangingStatus
            ? "מעדכן..."
            : watch.isActive
              ? "השבתת שעון"
              : "הפעלת שעון"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}