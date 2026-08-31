import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type {
  SupplierSaleDetails,
} from "../../types/supplierSale";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

type SupplierSaleDetailsDialogProps = {
  open: boolean;

  sale:
    | SupplierSaleDetails
    | null;

  onClose: () => void;
};

export default function SupplierSaleDetailsDialog({
  open,
  sale,
  onClose,
}: SupplierSaleDetailsDialogProps) {
  if (!sale) {
    return null;
  }

  const totalUnits =
    sale.items.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.quantity,
      0,
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        פרטי מכירה
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },

            gap: 2,
            mb: 3,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              תאריך
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontWeight: 600,
              }}
            >
              {formatDateTime(
                sale.soldAt,
              )}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              סכום המכירה
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 0.5,

                color:
                  "primary.dark",

                fontWeight: 600,
              }}
            >
              {formatCurrency(
                sale.totalAmount,
              )}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              סטטוס
            </Typography>

            <Box
              sx={{
                mt: 1,
              }}
            >
              <Chip
                size="small"
                label={
                  sale.status ===
                  "COMPLETED"
                    ? "הושלמה"
                    : "בוטלה"
                }
                color={
                  sale.status ===
                  "COMPLETED"
                    ? "success"
                    : "default"
                }
              />
            </Box>
          </Paper>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
          }}
        >
          סה״כ {totalUnits} יחידות
        </Typography>

        <Divider
          sx={{
            mb: 2,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
          }}
        >
          פריטי המכירה
        </Typography>

        <TableContainer
          component={Paper}
          variant="outlined"
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  שעון
                </TableCell>

                <TableCell>
                  כמות
                </TableCell>

                <TableCell>
                  מחיר ליחידה
                </TableCell>

                <TableCell>
                  סה״כ
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sale.items.map(
                (item) => (
                  <TableRow
                    key={
                      item.id
                    }
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight:
                            600,
                        }}
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

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {
                          item.watch
                            .sku
                        }
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {
                        item.quantity
                      }
                    </TableCell>

                    <TableCell>
                      {formatCurrency(
                        item.salePrice,
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight:
                            600,
                        }}
                      >
                        {formatCurrency(
                          Number(
                            item.salePrice,
                          ) *
                            item.quantity,
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {sale.notes && (
          <Box
            sx={{
              mt: 3,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
              }}
            >
              הערות
            </Typography>

            <Typography>
              {sale.notes}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}