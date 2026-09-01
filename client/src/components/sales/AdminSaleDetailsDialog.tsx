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
  AdminSaleDetails,
} from "../../types/adminSale";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

type AdminSaleDetailsDialogProps = {
  open: boolean;

  sale:
    | AdminSaleDetails
    | null;

  onClose: () => void;
};

export default function AdminSaleDetailsDialog({
  open,
  sale,
  onClose,
}: AdminSaleDetailsDialogProps) {
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
        {/* Sale summary */}
        <Box
          sx={{
            display:
              "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm:
                "repeat(2, minmax(0, 1fr))",
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
              ספק
            </Typography>

            <Typography
              sx={{
                mt: 0.5,

                fontWeight:
                  600,
              }}
            >
              {
                sale.supplier
                  .contactName
              }
            </Typography>

            {sale.supplier.user
              ?.username && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {
                  sale.supplier
                    .user
                    .username
                }
              </Typography>
            )}
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
              תאריך מכירה
            </Typography>

            <Typography
              sx={{
                mt: 0.5,

                fontWeight:
                  600,
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
              סכום כולל
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 0.5,

                color:
                  "primary.dark",

                fontWeight:
                  600,
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
                variant={
                  sale.status ===
                  "COMPLETED"
                    ? "filled"
                    : "outlined"
                }
              />
            </Box>
          </Paper>
        </Box>

        {/* Sale counts */}
        <Box
          sx={{
            display:
              "flex",

            gap: 3,
            mb: 3,

            flexWrap:
              "wrap",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            מספר פריטים:{" "}
            <strong>
              {sale.items.length}
            </strong>
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            סה״כ יחידות:{" "}
            <strong>
              {totalUnits}
            </strong>
          </Typography>
        </Box>

        <Divider
          sx={{
            mb: 2,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            mb: 2,

            fontWeight:
              600,
          }}
        >
          פריטי המכירה
        </Typography>

        {/* Sale items */}
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
                  מחיר לספק
                </TableCell>

                <TableCell>
                  מחיר מכירה
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
                            .name
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
                        item.supplierCostPrice,
                      )}
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

        {/* Notes */}
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