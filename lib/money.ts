// All money in the system is stored and computed as integer minor units (kobo).
// ₦1 = 100 kobo. Never use floats for money. Format to ₦ only at the display edge.

const NAIRA = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Format integer kobo as Naira for display, e.g. 1_200_000 -> "₦12,000". */
export function formatNaira(kobo: number): string {
  if (!Number.isInteger(kobo)) {
    throw new Error(`money must be integer kobo, received: ${kobo}`);
  }
  return NAIRA.format(kobo / 100);
}

/** Convert a whole-Naira price to integer kobo, e.g. 12000 -> 1_200_000. */
export function toKobo(amountNaira: number): number {
  return Math.round(amountNaira * 100);
}

/** Sum line items given as [unitKobo, qty] pairs. Returns integer kobo. */
export function sumKobo(items: Array<{ unitPriceKobo: number; qty: number }>): number {
  return items.reduce((total, i) => total + i.unitPriceKobo * i.qty, 0);
}
