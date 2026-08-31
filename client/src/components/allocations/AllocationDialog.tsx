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
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    HttpError,
} from "../../api/http";

import {
    createAllocation,
} from "../../api/allocations";

import type {
    SupplierListItem,
} from "../../types/supplier";

import type {
    WatchListItem,
} from "../../types/watch";

import {
    formatCurrency,
} from "../../utils/formatters";

type AllocationDialogProps = {
    open: boolean;

    suppliers:
    SupplierListItem[];

    watches:
    WatchListItem[];

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

export default function AllocationDialog({
    open,
    suppliers,
    watches,
    onClose,
    onSaved,
}: AllocationDialogProps) {
    const [
        supplierId,
        setSupplierId,
    ] = useState("");

    const [
        watchId,
        setWatchId,
    ] = useState("");

    const [
        quantity,
        setQuantity,
    ] = useState("1");

    const [
        supplierCostPrice,
        setSupplierCostPrice,
    ] = useState("");

    const [
        requiredSalePrice,
        setRequiredSalePrice,
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

        setSupplierId("");
        setWatchId("");
        setQuantity("1");
        setSupplierCostPrice("");
        setRequiredSalePrice("");
        setNotes("");
        setError("");
    }, [open]);

    const selectedWatch =
        watches.find(
            (watch) =>
                watch.id === watchId,
        );

    function handleWatchChange(
        newWatchId: string,
    ) {
        setWatchId(
            newWatchId,
        );

        const watch =
            watches.find(
                (item) =>
                    item.id ===
                    newWatchId,
            );

        if (!watch) {
            return;
        }

        setSupplierCostPrice(
            String(
                watch.defaultSupplierPrice,
            ),
        );

        setRequiredSalePrice(
            String(
                watch.recommendedSalePrice,
            ),
        );
    }

    async function handleSave() {
        if (!supplierId) {
            setError(
                "יש לבחור ספק",
            );

            return;
        }

        if (!watchId) {
            setError(
                "יש לבחור שעון",
            );

            return;
        }

        const parsedQuantity =
            Number(quantity);

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
            !isValidMoney(
                supplierCostPrice,
            ) ||
            !isValidMoney(
                requiredSalePrice,
            )
        ) {
            setError(
                "יש להזין מחירים תקינים",
            );

            return;
        }

        const parsedSupplierPrice =
            Number(
                supplierCostPrice,
            );

        const parsedRequiredPrice =
            Number(
                requiredSalePrice,
            );

        if (
            parsedRequiredPrice <
            parsedSupplierPrice
        ) {
            setError(
                "מחיר המכירה המינימלי לא יכול להיות נמוך מהמחיר לספק",
            );

            return;
        }

        const warehouseQuantity =
            selectedWatch
                ?.warehouseInventory
                ?.quantityOnHand ??
            0;

        if (
            parsedQuantity >
            warehouseQuantity
        ) {
            setError(
                `במחסן קיימות רק ${warehouseQuantity} יחידות מהשעון`,
            );

            return;
        }

        setError("");
        setIsSaving(true);

        try {
            await createAllocation({
                supplierId,
                watchId,

                quantity:
                    parsedQuantity,

                supplierCostPrice:
                    parsedSupplierPrice,

                requiredSalePrice:
                    parsedRequiredPrice,

                notes:
                    notes.trim() ||
                    undefined,
            });

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
                    "לא ניתן לבצע את ההקצאה",
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
                הקצאת מלאי לספק
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
                        select
                        label="ספק"
                        value={supplierId}
                        onChange={(event) =>
                            setSupplierId(
                                event.target.value,
                            )
                        }
                        required
                        fullWidth
                    >
                        {suppliers.map(
                            (supplier) => (
                                <MenuItem
                                    key={
                                        supplier.id
                                    }
                                    value={
                                        supplier.id
                                    }
                                >
                                    {
                                        supplier.companyName
                                    }
                                    {" — "}
                                    {
                                        supplier.user.username
                                    }
                                </MenuItem>
                            ),
                        )}
                    </TextField>

                    <TextField
                        select
                        label="שעון"
                        value={watchId}
                        onChange={(event) =>
                            handleWatchChange(
                                event.target.value,
                            )
                        }
                        required
                        fullWidth
                    >
                        {watches.map(
                            (watch) => {
                                const stock =
                                    watch
                                        .warehouseInventory
                                        ?.quantityOnHand ??
                                    0;

                                return (
                                    <MenuItem
                                        key={
                                            watch.id
                                        }
                                        value={
                                            watch.id
                                        }
                                        disabled={
                                            stock <= 0
                                        }
                                    >
                                        {watch.brand}{" "}
                                        {watch.model}
                                        {" — "}
                                        {stock} יח׳
                                    </MenuItem>
                                );
                            },
                        )}
                    </TextField>

                    {selectedWatch && (
                        <Box
                            sx={{
                                p: 2,

                                bgcolor:
                                    "background.default",

                                borderRadius: 2,

                                border:
                                    "1px solid",

                                borderColor:
                                    "divider",
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                מלאי זמין במחסן
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                {selectedWatch
                                    .warehouseInventory
                                    ?.quantityOnHand ??
                                    0}{" "}
                                יח׳
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 1,
                                }}
                            >
                                מחיר ברירת מחדל לספק:{" "}
                                {formatCurrency(
                                    selectedWatch.defaultSupplierPrice,
                                )}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                מחיר מכירה מומלץ:{" "}
                                {formatCurrency(
                                    selectedWatch.recommendedSalePrice,
                                )}
                            </Typography>
                        </Box>
                    )}

                    <TextField
                        label="כמות להקצאה"
                        type="number"
                        value={quantity}
                        onChange={(event) =>
                            setQuantity(
                                event.target.value,
                            )
                        }
                        slotProps={{
                            htmlInput: {
                                min: 1,
                                step: 1,
                            },
                        }}
                        required
                        fullWidth
                    />

                    <TextField
                        label="מחיר לספק"
                        type="number"
                        value={
                            supplierCostPrice
                        }
                        onChange={(event) =>
                            setSupplierCostPrice(
                                event.target.value,
                            )
                        }
                        required
                        fullWidth
                    />

                    <TextField
                        label="מחיר מכירה מינימלי"
                        type="number"
                        value={
                            requiredSalePrice
                        }
                        onChange={(event) =>
                            setRequiredSalePrice(
                                event.target.value,
                            )
                        }
                        helperText="הספק לא יוכל לדווח על מכירה במחיר נמוך מערך זה"
                        required
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
                        minRows={2}
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
                    onClick={
                        handleSave
                    }
                    disabled={isSaving}
                >
                    {isSaving
                        ? "מקצה..."
                        : "ביצוע הקצאה"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}