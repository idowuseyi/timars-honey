import Link from "next/link";
import { TrustSeal } from "@/components/TrustSeal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-comb text-wax">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <TrustSeal />
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
          Pure honey,{" "}
          <span className="text-honey">straight from the farm.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-wax/80">
          A decade of trusted supply, now online. Real honey — nothing added —
          in bottles and kegs, delivered across Nigeria.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-honey px-6 py-3 font-semibold text-comb transition-colors hover:bg-pollen"
          >
            Shop honey
          </Link>
          <Link
            href="/benefits"
            className="rounded-full border border-wax/30 px-6 py-3 font-semibold text-wax transition-colors hover:border-honey hover:text-honey"
          >
            Learn the benefits
          </Link>
        </div>
      </div>
      <div
        aria-hidden
        className="hex pointer-events-none absolute -right-16 -top-16 h-64 w-64 bg-bark/60"
      />
    </section>
  );
}
