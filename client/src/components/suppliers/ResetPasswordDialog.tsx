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
  TextField,
} from "@mui/material";

import {
  HttpError,
} from "../../api/http";

import {
  resetSupplierPassword,
} from "../../api/suppliers";

type ResetPasswordDialogProps = {
  open: boolean;

  supplierId:
    | string
    | null;

  supplierName: string;

  onClose: () => void;
};

export default function ResetPasswordDialog({
  open,
  supplierId,
  supplierName,
  onClose,
}: ResetPasswordDialogProps) {
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPassword("");
    setError("");
    setSuccess("");
  }, [open]);

  async function handleSave() {
    if (!supplierId) {
      return;
    }

    if (password.length < 8) {
      setError(
        "הסיסמה חייבת להכיל לפחות 8 תווים",
      );

      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await resetSupplierPassword(
        supplierId,
        password,
      );

      setPassword("");

      setSuccess(
        "הסיסמה עודכנה בהצלחה",
      );
    } catch (error) {
      if (
        error instanceof HttpError
      ) {
        setError(error.message);
      } else {
        setError(
          "לא ניתן לעדכן את הסיסמה",
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
        איפוס סיסמה
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

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
            }}
          >
            {success}
          </Alert>
        )}

        <TextField
          label={`סיסמה חדשה עבור ${supplierName}`}
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
          helperText="לפחות 8 תווים"
          fullWidth
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
          סגירה
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? "מעדכן..."
            : "עדכון סיסמה"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}