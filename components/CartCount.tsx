"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function CartCount() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/cart"
      className="relative text-sm text-wax/80 transition-colors hover:text-honey"
    >
      Cart
      {hydrated && count > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-honey px-1 font-mono text-xs text-comb">
          {count}
        </span>
      )}
    </Link>
  );
}
