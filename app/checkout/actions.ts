"use server";

import { createOrder, type Order } from "@/lib/orders";
import type { CartLine } from "@/lib/cart";
import { isDbConfigured, withDb } from "@/db/client";
import { loadCatalogue, persistOrder } from "@/lib/repo";

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

export type PlaceOrderError = { ok: false; error: string };

// Server-side order placement. The client sends only slug + qty; the server
// rebuilds every price from the catalogue (never trusts client money). With Neon
// configured, prices come from the DB and the order is persisted as `pending`;
// without it (local dev, pre-credentials) the static seed prices the order and
// nothing is stored. Shipping is 0 until the courier milestone; payment is M3.
export async function placeOrder(
  items: CartLine[],
  contact: Contact,
): Promise<PlaceOrderResult | PlaceOrderError> {
  const invalid = validateContact(contact);
  if (invalid) return { ok: false, error: invalid };
  const lines = items.map((i) => ({ slug: i.slug, qty: i.qty }));

  let order: Order;
  try {
    if (!isDbConfigured()) {
      order = createOrder(lines);
    } else {
      order = await withDb(async (db) => {
        const o = createOrder(lines, { catalogue: await loadCatalogue(db) });
        try {
          await persistOrder(db, o, contact);
        } catch (err) {
          throw new PersistError(o, err);
        }
        return o;
      });
    }
  } catch (e) {
    if (e instanceof PersistError) {
      const handled = handlePersistFailure(e.order, e.cause);
      if (!handled.ok) return handled;
      order = e.order;
    } else {
      return { ok: false, error: e instanceof Error ? e.message : "could not place order" };
    }
  }
  return toResult(order);
}

/** The order priced fine but the DB write failed (Neon down, timeout, …). The
 *  shopper has a valid cart and an order ref; decide what they see next.
 *  Return `{ ok: true }` to continue to the WhatsApp payment handoff with the
 *  unsaved order, or a `PlaceOrderError` to stop checkout with a message. */
function handlePersistFailure(
  order: Order,
  err: unknown,
): { ok: true } | PlaceOrderError {
  // Policy: never lose a sale to a DB outage. The shopper continues to the
  // WhatsApp payment handoff; the log line carries enough to re-key the order.
  console.error("order not persisted — continuing to WhatsApp handoff", {
    ref: order.ref,
    totalKobo: order.totalKobo,
    items: order.items.map((i) => `${i.slug}×${i.qty}`),
    err: err instanceof Error ? err.message : String(err),
  });
  return { ok: true };
}

class PersistError extends Error {
  constructor(
    readonly order: Order,
    readonly cause: unknown,
  ) {
    super("order could not be saved");
  }
}

function validateContact(c: Contact): string | null {
  if (!c?.name?.trim()) return "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email ?? "")) return "Please enter a valid email.";
  if ((c.phone ?? "").replace(/\D/g, "").length < 7) return "Please enter a valid phone number.";
  return null;
}

function toResult(order: Order): PlaceOrderResult {
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
}
