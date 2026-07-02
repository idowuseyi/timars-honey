import { describe, it, expect } from "vitest";
import { PRODUCTS, getProduct } from "../lib/products";

describe("catalogue", () => {
  it("has the five v1 SKUs", () => {
    expect(PRODUCTS).toHaveLength(5);
  });

  it("every product is complete with a positive integer kobo price", () => {
    for (const p of PRODUCTS) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.sizeLabel).toBeTruthy();
      expect(Number.isInteger(p.priceKobo)).toBe(true);
      expect(p.priceKobo).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });

  it("has unique slugs", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("prices match the brief", () => {
    expect(getProduct("big-50cl")?.priceKobo).toBe(600_000);
    expect(getProduct("biggy-1l")?.priceKobo).toBe(1_200_000);
    expect(getProduct("keg-a-5l")?.priceKobo).toBe(5_500_000);
    expect(getProduct("keg-c-10l")?.priceKobo).toBe(9_900_000);
    expect(getProduct("keg-b-25l")?.priceKobo).toBe(21_800_000);
  });
});
