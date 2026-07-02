"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export function AddToCartButton({ slug }: { slug: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        add(slug);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="rounded-full bg-honey px-6 py-3 font-semibold text-comb transition-colors hover:bg-pollen"
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
