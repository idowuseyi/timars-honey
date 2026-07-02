import Link from "next/link";
import { Hero } from "@/components/Hero";
import { BenefitCarousel } from "@/components/BenefitCarousel";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 3);
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Our honey</h2>
          <Link href="/shop" className="text-sm font-semibold text-propolis hover:text-honey">
            See all sizes →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <BenefitCarousel />

      <section className="bg-bark text-wax">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            ["Farm-sourced", "Harvested and packed in a clean, healthy environment."],
            ["A decade of trust", "Over ten years supplying honey to homes and traders."],
            ["Nothing added", "Pure honey — its originality speaks for itself."],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="font-display text-xl text-honey">{title}</p>
              <p className="mt-2 text-sm text-wax/75">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
