import type {
  MoneyValue,
} from "../types/dashboard";

export function toNumber(
  value: MoneyValue,
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

export function formatCurrency(
  value: MoneyValue,
): string {
  return new Intl.NumberFormat(
    "he-IL",
    {
      style: "currency",
      currency: "ILS",
      maximumFractionDigits: 0,
    },
  ).format(toNumber(value));
}

export function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "he-IL",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}