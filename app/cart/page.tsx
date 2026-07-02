"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { getProduct } from "@/lib/products";
import { formatNaira } from "@/lib/money";

export default function CartPage() {
  const { items, setQty, remove, hydrated } = useCart();

  const lines = items
    .map((l) => ({ line: l, product: getProduct(l.slug) }))
    .filter((x) => x.product);
  const subtotalKobo = lines.reduce(
    (s, x) => s + (x.product!.priceKobo * x.line.qty),
    0,
  );

  if (!hydrated) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-comb/60">Loading cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-4xl">Your cart</h1>
        <p className="mt-3 text-comb/70">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-honey px-6 py-3 font-semibold text-comb hover:bg-pollen"
        >
          Shop honey
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl">Your cart</h1>
      <ul className="mt-8 divide-y divide-comb/10">
        {lines.map(({ line, product }) => (
          <li key={line.slug} className="flex items-center gap-4 py-4">
            <div className="hex flex h-14 w-14 shrink-0 items-center justify-center bg-bark font-display text-honey">
              {product!.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-display text-lg">{product!.name}</p>
              <p className="text-sm text-comb/60">{product!.sizeLabel}</p>
            </div>
            <input
              type="number"
              min={0}
              value={line.qty}
              onChange={(e) => setQty(line.slug, parseInt(e.target.value || "0", 10))}
              aria-label={`Quantity for ${product!.name}`}
              className="w-16 rounded-lg border border-comb/20 px-2 py-1 text-center"
            />
            <p className="w-28 text-right font-mono">
              {formatNaira(product!.priceKobo * line.qty)}
            </p>
            <button
              onClick={() => remove(line.slug)}
              aria-label={`Remove ${product!.name}`}
              className="text-comb/40 hover:text-comb"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-comb/10 pt-4">
        <span className="text-comb/70">Subtotal</span>
        <span className="font-mono text-xl">{formatNaira(subtotalKobo)}</span>
      </div>
      <p className="mt-1 text-right text-xs text-comb/50">
        Delivery calculated at the next step.
      </p>

      <Link
        href="/checkout"
        className="mt-6 inline-block rounded-full bg-honey px-8 py-3 font-semibold text-comb hover:bg-pollen"
      >
        Checkout
      </Link>
    </div>
  );
}
