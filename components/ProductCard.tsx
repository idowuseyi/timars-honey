import Link from "next/link";
import { formatNaira } from "@/lib/money";
import type { Product } from "@/lib/products";

// Product photos slot into the hex frame once supplied; until then a branded
// placeholder keeps the layout valid (design "Error Handling": missing image).
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl border border-comb/10 bg-white p-4 shadow-sm transition-transform hover:-translate-y-1"
    >
      <div className="hex mx-auto flex aspect-square w-full items-center justify-center bg-bark text-honey">
        <span className="font-display text-3xl">{product.name}</span>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-lg">{product.name}</h3>
        <p className="text-sm text-comb/60">{product.sizeLabel}</p>
        <p className="mt-2 font-mono text-lg">{formatNaira(product.priceKobo)}</p>
      </div>
      <span className="mt-3 inline-block rounded-full bg-honey px-4 py-1.5 text-sm font-semibold text-comb transition-colors group-hover:bg-pollen">
        View
      </span>
    </Link>
  );
}
