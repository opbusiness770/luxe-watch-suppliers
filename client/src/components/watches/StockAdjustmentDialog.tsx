import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import {
  HttpError,
} from "../../api/http";

import {
  adjustWatchStock,
} from "../../api/watches";

type StockAdjustmentDialogProps = {
  open: boolean;

  watchId:
    | string
    | null;

  watchName: string;

  currentQuantity: number;

  onClose: () => void;
  onSaved: () => void;
};

export default function StockAdjustmentDialog({
  open,
  watchId,
  watchName,
  currentQuantity,
  onClose,
  onSaved,
}: StockAdjustmentDialogProps) {
  const [
    quantityChange,
    setQuantityChange,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

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

    setQuantityChange("");
    setNotes("");
    setError("");
  }, [open]);

  const parsedChange =
    Number(quantityChange);

  const newQuantity =
    Number.isFinite(
      parsedChange,
    )
      ? currentQuantity +
        parsedChange
      : currentQuantity;

  async function handleSave() {
    if (!watchId) {
      return;
    }

    if (
      !Number.isInteger(
        parsedChange,
      ) ||
      parsedChange === 0
    ) {
      setError(
        "השינוי במלאי חייב להיות מספר שלם שונה מאפס",
      );

      return;
    }

    if (
      newQuantity < 0
    ) {
      setError(
        "לא ניתן להפחית יותר יחידות מהמלאי הקיים",
      );

      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await adjustWatchStock(
        watchId,
        parsedChange,
        notes,
      );

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
          "לא ניתן לעדכן את המלאי",
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
      maxWidth="xs"
    >
      <DialogTitle>
        עדכון מלאי
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
            }}
          >
            {error}
          </Alert>
        )}

        <Typography
          sx={{
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {watchName}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          מלאי נוכחי:{" "}
          {currentQuantity}
        </Typography>

        <TextField
          label="שינוי בכמות"
          type="number"
          value={
            quantityChange
          }
          onChange={(event) =>
            setQuantityChange(
              event.target.value,
            )
          }
          helperText="מספר חיובי להוספה, מספר שלילי להפחתה"
          fullWidth
        />

        {quantityChange &&
          Number.isFinite(
            parsedChange,
          ) && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor:
                  "background.default",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                מלאי לאחר השינוי
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mt: 0.5,
                  color:
                    newQuantity < 0
                      ? "error.main"
                      : "primary.dark",
                }}
              >
                {newQuantity}
              </Typography>
            </Box>
          )}

        <TextField
          label="הערה"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          placeholder="לדוגמה: קבלת משלוח חדש"
          multiline
          minRows={2}
          fullWidth
          sx={{
            mt: 2,
          }}
        />
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
            ? "מעדכן..."
            : "עדכון מלאי"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}