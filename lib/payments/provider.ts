// Payment abstraction (design "PaymentProvider"): Paystack is the default; Flutterwave
// and Stripe enable automatically when their credentials exist. This interface is also
// the contract a future Rust backend re-implements — keep it free of framework types.

export type ProviderId = "paystack" | "flutterwave" | "stripe";

export interface InitInput {
  orderRef: string;
  amountKobo: number;
  email: string;
  currency: "NGN";
}

export interface InitResult {
  reference: string;
  /** Paystack/Flutterwave hosted-checkout redirect. */
  redirectUrl?: string;
  /** Stripe client secret for an embedded confirmation. */
  clientSecret?: string;
}

export interface VerifyResult {
  status: "success" | "failed" | "pending";
  amountKobo: number;
  currency: string;
}

export interface WebhookResult {
  valid: boolean;
  event?: string;
  reference?: string;
}

export interface PaymentProvider {
  id: ProviderId;
  /** True when this provider's credentials are configured. */
  isEnabled(): boolean;
  /** ISO country code support, e.g. Paystack -> NG; Flutterwave/Stripe -> intl. */
  supportsCountry(code: string): boolean;
  initialize(input: InitInput): Promise<InitResult>;
  /** Server-side confirmation — the ONLY thing that may mark an order paid. */
  verify(reference: string): Promise<VerifyResult>;
  /** Verify a webhook's signature against the raw body. */
  verifyWebhook(rawBody: string, headers: Record<string, string>): WebhookResult;
}

/**
 * Choose a provider for a destination country. Policy (a real decision point — tune
 * to the business): NG → Paystack when enabled; otherwise the first enabled provider
 * that supports the country; otherwise fall back to Paystack, then anything enabled.
 * Returns null when no provider is configured (checkout must then block, not silently
 * fail).
 */
export function selectProvider(
  country: string,
  providers: PaymentProvider[],
): PaymentProvider | null {
  const enabled = providers.filter((p) => p.isEnabled());
  if (enabled.length === 0) return null;

  const cc = country.toUpperCase();
  const paystack = enabled.find((p) => p.id === "paystack");

  if (cc === "NG" && paystack && paystack.supportsCountry("NG")) {
    return paystack;
  }
  const regional = enabled.find((p) => p.supportsCountry(cc));
  return regional ?? paystack ?? enabled[0];
}
