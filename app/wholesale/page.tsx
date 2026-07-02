import type { Metadata } from "next";
import { WholesaleForm } from "@/components/WholesaleForm";

export const metadata: Metadata = {
  title: "Wholesale & Distributors",
  description:
    "Buy Timars honey in bulk. Become a distributor — kegs from 5 to 25 litres at trade prices.",
};

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl">Become a distributor</h1>
      <p className="mt-3 max-w-xl text-comb/80">
        We supply shops, resellers, and trade partners with pure honey in bulk
        kegs. Tell us about your business and we&apos;ll get back to you with trade
        pricing.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["Bulk kegs", "5, 10, and 25-litre kegs at better per-litre pricing."],
          ["Reliable supply", "A decade of consistent, trusted sourcing."],
          ["Direct line", "Talk to us on WhatsApp for fast answers."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-xl border border-comb/10 bg-white p-4">
            <p className="font-display text-lg">{t}</p>
            <p className="mt-1 text-sm text-comb/70">{b}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl">Distributor enquiry</h2>
      <WholesaleForm />
    </div>
  );
}
