import { buildOrderDraft, type CartLine, type OrderDraft } from "./cart";
import type { Product } from "./products";

export interface Order extends OrderDraft {
  ref: string;
  shippingKobo: number;
  totalKobo: number;
}

/** Build a priced order from a cart. Shipping defaults to 0 (arranged after
 *  checkout until the courier milestone lands). `catalogue` defaults to the static
 *  seed; checkout passes the DB catalogue when Neon is configured. `ref` is
 *  injectable for tests. */
export function createOrder(
  lines: CartLine[],
  opts: { shippingKobo?: number; ref?: string; catalogue?: Product[] } = {},
): Order {
  const draft = buildOrderDraft(lines, opts.catalogue);
  if (draft.items.length === 0) throw new Error("cart is empty");
  const shippingKobo = opts.shippingKobo ?? 0;
  return {
    ...draft,
    ref: opts.ref ?? newOrderRef(),
    shippingKobo,
    totalKobo: draft.subtotalKobo + shippingKobo,
  };
}

export function newOrderRef(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `TH-${rand.toUpperCase()}`;
}
