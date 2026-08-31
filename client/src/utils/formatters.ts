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

export function startOfLocalDayIso(
  value: string,
): string {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    0,
    0,
    0,
    0,
  );

  return date.toISOString();
}

export function endOfLocalDayIso(
  value: string,
): string {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    23,
    59,
    59,
    999,
  );

  return date.toISOString();
}