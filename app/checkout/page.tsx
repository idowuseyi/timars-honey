"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/money";
import { whatsappLink } from "@/lib/whatsapp";
import { placeOrder, type PlaceOrderResult, type Contact } from "./actions";

const field =
  "mt-1 w-full rounded-lg border border-comb/20 bg-white px-3 py-2 text-comb outline-none focus:border-honey";

export default function CheckoutPage() {
  const { items, clear, hydrated } = useCart();
  const [contact, setContact] = useState<Contact>({
    name: "",
    email: "",
    phone: "",
    country: "NG",
    state: "",
    city: "",
  });
  const [result, setResult] = useState<PlaceOrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set =
    (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setContact((c) => ({ ...c, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await placeOrder(items, contact);
    setSubmitting(false);
    if (res.ok) {
      setResult(res);
      clear();
    } else {
      setError(res.error);
    }
  }

  if (result) {
    const payMsg =
      `Hello Timars Honey! I'd like to pay for order ${result.ref} ` +
      `(total ${formatNaira(result.totalKobo)}).`;
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-propolis">
          Order placed
        </p>
        <h1 className="mt-2 font-display text-4xl">Thank you!</h1>
        <p className="mt-2 text-comb/70">
          Your order reference is{" "}
          <span className="font-mono text-comb">{result.ref}</span>.
        </p>

        <ul className="mt-6 divide-y divide-comb/10 rounded-xl border border-comb/10 bg-white px-4">
          {result.items.map((i, idx) => (
            <li key={idx} className="flex justify-between py-3 text-sm">
              <span>
                {i.name} · {i.sizeLabel} × {i.qty}
              </span>
              <span className="font-mono">{formatNaira(i.lineKobo)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3 font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatNaira(result.totalKobo)}</span>
          </li>
        </ul>

        <p className="mt-6 text-sm text-comb/70">
          Online card payment is arriving shortly. For now, confirm and pay for
          your order on WhatsApp:
        </p>
        <a
          href={whatsappLink(payMsg)}
          className="mt-3 inline-block rounded-full bg-honey px-8 py-3 font-semibold text-comb hover:bg-pollen"
        >
          Confirm on WhatsApp
        </a>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-3 text-comb/70">Your cart is empty.</p>
        <Link href="/shop" className="mt-6 inline-block font-semibold text-propolis hover:text-honey">
          Shop honey →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-comb/70">
        Delivery in Nigeria; international buyers arrange shipping on WhatsApp
        after paying.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Full name
          <input required value={contact.name} onChange={set("name")} className={field} />
        </label>
        <label className="block text-sm">
          Email
          <input required type="email" value={contact.email} onChange={set("email")} className={field} />
        </label>
        <label className="block text-sm">
          Phone
          <input required value={contact.phone} onChange={set("phone")} className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            Country
            <input value={contact.country} onChange={set("country")} className={field} />
          </label>
          <label className="block text-sm">
            State
            <input value={contact.state} onChange={set("state")} className={field} />
          </label>
          <label className="block text-sm">
            City
            <input value={contact.city} onChange={set("city")} className={field} />
          </label>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-honey px-8 py-3 font-semibold text-comb transition-colors hover:bg-pollen disabled:opacity-60"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
