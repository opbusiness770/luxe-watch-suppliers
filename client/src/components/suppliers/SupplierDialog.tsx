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
  createSupplier,
  updateSupplier,
} from "../../api/suppliers";

import type {
  SupplierDetails,
} from "../../types/supplier";

type SupplierDialogProps = {
  open: boolean;

  supplier:
    | SupplierDetails
    | null;

  onClose: () => void;

  onSaved: () => void;
};

export default function SupplierDialog({
  open,
  supplier,
  onClose,
  onSaved,
}: SupplierDialogProps) {
  const isEdit =
    supplier !== null;

  const [
    contactName,
    setContactName,
  ] = useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    address,
    setAddress,
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

  /*
   * Initializes the form whenever the dialog opens.
   *
   * When editing an existing supplier, the current
   * supplier details are loaded into the form.
   *
   * When creating a new supplier, all fields start empty.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setContactName(
      supplier?.contactName ?? "",
    );

    setUsername(
      supplier?.user.username ?? "",
    );

    setPassword("");

    setEmail(
      supplier?.user.email ?? "",
    );

    setPhone(
      supplier?.phone ?? "",
    );

    setAddress(
      supplier?.address ?? "",
    );

    setNotes(
      supplier?.notes ?? "",
    );

    setError("");
  }, [
    open,
    supplier,
  ]);

  async function handleSave() {
    const normalizedContactName =
      contactName.trim();

    /*
     * Contact name is the main supplier name
     * used throughout the system.
     */
    if (!normalizedContactName) {
      setError(
        "יש להזין שם איש קשר",
      );

      return;
    }

    /*
     * Username and password are required only
     * when creating a new supplier.
     */
    if (!isEdit) {
      const normalizedUsername =
        username.trim();

      if (
        normalizedUsername.length <
        3
      ) {
        setError(
          "שם המשתמש חייב להכיל לפחות 3 תווים",
        );

        return;
      }

      if (
        password.length <
        8
      ) {
        setError(
          "הסיסמה חייבת להכיל לפחות 8 תווים",
        );

        return;
      }
    }

    setError("");
    setIsSaving(true);

    try {
      if (supplier) {
        /*
         * Update existing supplier.
         *
         * Username and password are not changed
         * from this dialog.
         */
        await updateSupplier(
          supplier.id,
          {
            contactName:
              normalizedContactName,

            email:
              email.trim() ||
              null,

            phone:
              phone.trim() ||
              null,

            address:
              address.trim() ||
              null,

            notes:
              notes.trim() ||
              null,
          },
        );
      } else {
        /*
         * Create a new supplier account.
         */
        await createSupplier({
          contactName:
            normalizedContactName,

          username:
            username.trim(),

          password,

          email:
            email.trim() ||
            undefined,

          phone:
            phone.trim() ||
            undefined,

          address:
            address.trim() ||
            undefined,

          notes:
            notes.trim() ||
            undefined,
        });
      }

      onSaved();
      onClose();
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
          "לא ניתן לשמור את פרטי הספק",
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
          ? "עריכת ספק"
          : "הוספת ספק חדש"}
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
            label="שם איש קשר"
            value={contactName}
            onChange={(event) =>
              setContactName(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="שם משתמש"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value,
              )
            }
            disabled={isEdit}
            required={!isEdit}
            fullWidth
            helperText={
              isEdit
                ? "לא ניתן לשנות את שם המשתמש מכאן"
                : "לפחות 3 תווים"
            }
          />

          {!isEdit && (
            <TextField
              label="סיסמה ראשונית"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              required
              fullWidth
              helperText="לפחות 8 תווים"
            />
          )}

          <TextField
            label="אימייל"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            fullWidth
          />

          <TextField
            label="טלפון"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value,
              )
            }
            fullWidth
          />

          <TextField
            label="כתובת"
            value={address}
            onChange={(event) =>
              setAddress(
                event.target.value,
              )
            }
            fullWidth
          />

          <TextField
            label="הערות"
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            multiline
            minRows={3}
            fullWidth
          />
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
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? "שומר..."
            : isEdit
              ? "שמירת שינויים"
              : "יצירת ספק"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}