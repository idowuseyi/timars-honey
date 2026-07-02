import { describe, it, expect } from "vitest";
import { formatNaira, toKobo, sumKobo } from "../lib/money";

describe("money", () => {
  it("formats integer kobo as naira without decimals", () => {
    expect(formatNaira(1_200_000)).toContain("12,000");
    expect(formatNaira(600_000)).toContain("6,000");
  });

  it("rejects non-integer kobo (no floats for money)", () => {
    expect(() => formatNaira(12.5)).toThrow();
  });

  it("converts whole naira to kobo", () => {
    expect(toKobo(12000)).toBe(1_200_000);
  });

  it("sums line items in kobo", () => {
    expect(
      sumKobo([
        { unitPriceKobo: 600_000, qty: 2 },
        { unitPriceKobo: 1_200_000, qty: 1 },
      ]),
    ).toBe(2_400_000);
  });
});
