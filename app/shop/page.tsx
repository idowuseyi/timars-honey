import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Pure Timars honey in bottles and kegs — from 50 cl to 25 litres.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-4xl">Shop honey</h1>
      <p className="mt-2 max-w-xl text-comb/70">
        Every size is the same pure, farm-sourced honey. Bottles for the home,
        kegs for families and trade.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
