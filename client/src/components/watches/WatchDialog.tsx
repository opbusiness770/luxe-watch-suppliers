import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import {
  HttpError,
} from "../../api/http";

import {
  createWatch,
  updateWatch,
} from "../../api/watches";

import type {
  WatchDetails,
} from "../../types/watch";

type WatchDialogProps = {
  open: boolean;

  watch:
    | WatchDetails
    | null;

  onClose: () => void;
  onSaved: () => void;
};

function isValidMoney(
  value: string,
): boolean {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return false;
  }

  return /^\d+(\.\d{1,2})?$/.test(
    value,
  );
}

export default function WatchDialog({
  open,
  watch,
  onClose,
  onSaved,
}: WatchDialogProps) {
  const isEdit =
    watch !== null;

  const [
    sku,
    setSku,
  ] = useState("");

  const [
    brand,
    setBrand,
  ] = useState("");

  const [
    model,
    setModel,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    imageUrl,
    setImageUrl,
  ] = useState("");

  const [
    adminCostPrice,
    setAdminCostPrice,
  ] = useState("");

  const [
    defaultSupplierPrice,
    setDefaultSupplierPrice,
  ] = useState("");

  const [
    recommendedSalePrice,
    setRecommendedSalePrice,
  ] = useState("");

  const [
    initialQuantity,
    setInitialQuantity,
  ] = useState("0");

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSku(
      watch?.sku ?? "",
    );

    setBrand(
      watch?.brand ?? "",
    );

    setModel(
      watch?.model ?? "",
    );

    setName(
      watch?.name ?? "",
    );

    setDescription(
      watch?.description ?? "",
    );

    setImageUrl(
      watch?.imageUrl ?? "",
    );

    setAdminCostPrice(
      watch
        ? String(
            watch.adminCostPrice,
          )
        : "",
    );

    setDefaultSupplierPrice(
      watch
        ? String(
            watch.defaultSupplierPrice,
          )
        : "",
    );

    setRecommendedSalePrice(
      watch
        ? String(
            watch.recommendedSalePrice,
          )
        : "",
    );

    setInitialQuantity("0");
    setError("");
  }, [
    open,
    watch,
  ]);

  async function handleSave() {
    const normalizedSku =
      sku.trim();

    const normalizedBrand =
      brand.trim();

    const normalizedModel =
      model.trim();

    const normalizedName =
      name.trim();

    if (
      !normalizedBrand ||
      !normalizedModel ||
      !normalizedName
    ) {
      setError(
        "יש להזין מותג, דגם ושם שעון",
      );

      return;
    }

    if (
      !isEdit &&
      !normalizedSku
    ) {
      setError(
        "יש להזין מק״ט",
      );

      return;
    }

    if (
      !isValidMoney(
        adminCostPrice,
      ) ||
      !isValidMoney(
        defaultSupplierPrice,
      ) ||
      !isValidMoney(
        recommendedSalePrice,
      )
    ) {
      setError(
        "יש להזין מחירים תקינים עם עד שתי ספרות אחרי הנקודה",
      );

      return;
    }

    const parsedInitialQuantity =
      Number(initialQuantity);

    if (
      !isEdit &&
      (
        !Number.isInteger(
          parsedInitialQuantity,
        ) ||
        parsedInitialQuantity < 0
      )
    ) {
      setError(
        "המלאי ההתחלתי חייב להיות מספר שלם שאינו שלילי",
      );

      return;
    }

    setError("");
    setIsSaving(true);

    try {
      if (watch) {
        await updateWatch(
          watch.id,
          {
            brand:
              normalizedBrand,

            model:
              normalizedModel,

            name:
              normalizedName,

            description:
              description.trim() ||
              null,

            imageUrl:
              imageUrl.trim() ||
              null,

            adminCostPrice:
              Number(
                adminCostPrice,
              ),

            defaultSupplierPrice:
              Number(
                defaultSupplierPrice,
              ),

            recommendedSalePrice:
              Number(
                recommendedSalePrice,
              ),
          },
        );
      } else {
        await createWatch({
          sku:
            normalizedSku,

          brand:
            normalizedBrand,

          model:
            normalizedModel,

          name:
            normalizedName,

          description:
            description.trim() ||
            undefined,

          imageUrl:
            imageUrl.trim() ||
            undefined,

          adminCostPrice:
            Number(
              adminCostPrice,
            ),

          defaultSupplierPrice:
            Number(
              defaultSupplierPrice,
            ),

          recommendedSalePrice:
            Number(
              recommendedSalePrice,
            ),

          initialQuantity:
            parsedInitialQuantity,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      if (
        error instanceof HttpError
      ) {
        setError(
          error.message,
        );
      } else {
        setError(
          "לא ניתן לשמור את פרטי השעון",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={
        isSaving
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEdit
          ? "עריכת שעון"
          : "הוספת שעון חדש"}
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            pt: 1,
          }}
        >
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="מק״ט"
            value={sku}
            onChange={(event) =>
              setSku(
                event.target.value,
              )
            }
            disabled={isEdit}
            required={!isEdit}
            fullWidth
          />

          <TextField
            label="מותג"
            value={brand}
            onChange={(event) =>
              setBrand(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="דגם"
            value={model}
            onChange={(event) =>
              setModel(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="שם השעון"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="תיאור"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            multiline
            minRows={3}
            fullWidth
          />

          <TextField
            label="כתובת תמונה"
            value={imageUrl}
            onChange={(event) =>
              setImageUrl(
                event.target.value,
              )
            }
            placeholder="https://..."
            fullWidth
          />

          <TextField
            label="עלות למנהל"
            type="number"
            value={adminCostPrice}
            onChange={(event) =>
              setAdminCostPrice(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="מחיר ברירת מחדל לספק"
            type="number"
            value={
              defaultSupplierPrice
            }
            onChange={(event) =>
              setDefaultSupplierPrice(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="מחיר מכירה מומלץ"
            type="number"
            value={
              recommendedSalePrice
            }
            onChange={(event) =>
              setRecommendedSalePrice(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          {!isEdit && (
            <TextField
              label="מלאי התחלתי במחסן"
              type="number"
              value={
                initialQuantity
              }
              onChange={(event) =>
                setInitialQuantity(
                  event.target.value,
                )
              }
              helperText="ניתן להזין 0 ולהוסיף מלאי מאוחר יותר"
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          onClick={onClose}
          disabled={isSaving}
        >
          ביטול
        </Button>

        <Button
          variant="contained"
          onClick={
            handleSave
          }
          disabled={isSaving}
        >
          {isSaving
            ? "שומר..."
            : isEdit
              ? "שמירת שינויים"
              : "יצירת שעון"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}