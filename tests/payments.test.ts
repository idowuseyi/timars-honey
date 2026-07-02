import { describe, it, expect } from "vitest";
import { selectProvider, type PaymentProvider } from "../lib/payments/provider";

function mock(
  id: PaymentProvider["id"],
  enabled: boolean,
  countries: string[],
): PaymentProvider {
  return {
    id,
    isEnabled: () => enabled,
    supportsCountry: (c) => countries.includes(c.toUpperCase()),
    initialize: async () => ({ reference: "ref" }),
    verify: async () => ({ status: "pending", amountKobo: 0, currency: "NGN" }),
    verifyWebhook: () => ({ valid: false }),
  };
}

describe("selectProvider", () => {
  const paystack = mock("paystack", true, ["NG"]);
  const flutterwave = mock("flutterwave", true, ["NG", "US", "GB"]);
  const stripeDisabled = mock("stripe", false, ["US", "GB"]);

  it("returns null when no provider is enabled", () => {
    expect(selectProvider("NG", [mock("paystack", false, ["NG"])])).toBeNull();
  });

  it("defaults to Paystack for Nigeria", () => {
    expect(selectProvider("NG", [paystack, flutterwave])?.id).toBe("paystack");
  });

  it("routes international orders to an enabled provider that supports the country", () => {
    expect(selectProvider("US", [paystack, flutterwave])?.id).toBe("flutterwave");
  });

  it("never selects a disabled provider", () => {
    expect(selectProvider("US", [paystack, flutterwave, stripeDisabled])?.id).toBe(
      "flutterwave",
    );
  });
});
