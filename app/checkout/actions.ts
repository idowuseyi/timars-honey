"use server";

import { createOrder } from "@/lib/orders";
import type { CartLine } from "@/lib/cart";

export interface Contact {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
}

export interface PlaceOrderResult {
  ok: true;
  ref: string;
  items: { name: string; sizeLabel: string; qty: number; lineKobo: number }[];
  subtotalKobo: number;
  shippingKobo: number;
  totalKobo: number;
}

// Server-side order placement. The client sends only slug + qty; the server
// rebuilds every price from the catalogue (never trusts client money). Shipping
// is 0 until the courier milestone. Payment init + DB persistence land in M3.
export async function placeOrder(
  items: CartLine[],
  _contact: Contact,
): Promise<PlaceOrderResult | { ok: false; error: string }> {
  try {
    const order = createOrder(items.map((i) => ({ slug: i.slug, qty: i.qty })));
    return {
      ok: true,
      ref: order.ref,
      items: order.items.map((i) => ({
        name: i.name,
        sizeLabel: i.sizeLabel,
        qty: i.qty,
        lineKobo: i.lineKobo,
      })),
      subtotalKobo: order.subtotalKobo,
      shippingKobo: order.shippingKobo,
      totalKobo: order.totalKobo,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "could not place order" };
  }
}
