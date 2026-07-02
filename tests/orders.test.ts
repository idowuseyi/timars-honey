import { describe, it, expect } from "vitest";
import { buildOrderDraft, type CartLine } from "../lib/cart";
import { createOrder } from "../lib/orders";

describe("buildOrderDraft (server recomputes prices)", () => {
  it("prices lines from the catalogue, not the client", () => {
    // Even if a client sneaks a price field in, the type is slug+qty and the
    // server looks the price up itself — tampering is impossible.
    const lines = [{ slug: "biggy-1l", qty: 2, unitPriceKobo: 1 }] as unknown as CartLine[];
    const draft = buildOrderDraft(lines);
    expect(draft.items[0].unitPriceKobo).toBe(1_200_000);
    expect(draft.subtotalKobo).toBe(2_400_000);
  });

  it("sums multiple lines", () => {
    const draft = buildOrderDraft([
      { slug: "big-50cl", qty: 3 },
      { slug: "keg-a-5l", qty: 1 },
    ]);
    expect(draft.subtotalKobo).toBe(600_000 * 3 + 5_500_000);
  });

  it("skips non-positive quantities", () => {
    const draft = buildOrderDraft([{ slug: "biggy-1l", qty: 0 }]);
    expect(draft.items).toHaveLength(0);
  });

  it("throws on an unknown product", () => {
    expect(() => buildOrderDraft([{ slug: "nope", qty: 1 }])).toThrow();
  });
});

describe("createOrder", () => {
  it("adds shipping to the subtotal and carries a ref", () => {
    const order = createOrder([{ slug: "biggy-1l", qty: 1 }], {
      shippingKobo: 250_000,
      ref: "TH-TEST",
    });
    expect(order.ref).toBe("TH-TEST");
    expect(order.subtotalKobo).toBe(1_200_000);
    expect(order.totalKobo).toBe(1_450_000);
  });

  it("rejects an empty cart", () => {
    expect(() => createOrder([])).toThrow();
  });
});
