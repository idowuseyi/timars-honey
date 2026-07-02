import type { Metadata } from "next";
import { BENEFITS, BENEFITS_DISCLAIMER } from "@/lib/benefits";

export const metadata: Metadata = {
  title: "Honey Benefits A–Z",
  description:
    "An A–Z of the everyday benefits of honey and simple ways to enjoy them — general wellness, not medical advice.",
};

export default function BenefitsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl">Honey Benefits, A–Z</h1>
      <p className="mt-2 max-w-xl text-comb/70">
        Simple, everyday ways to enjoy honey. We keep adding letters — more on the
        way.
      </p>
      <p className="mt-3 rounded-lg bg-comb/5 px-4 py-3 text-xs text-comb/60">
        {BENEFITS_DISCLAIMER}
      </p>

      <ul className="mt-10 space-y-6">
        {BENEFITS.map((b) => (
          <li key={b.letter} className="flex items-start gap-5">
            <span
              aria-hidden
              className="hex flex h-14 w-14 shrink-0 items-center justify-center bg-honey font-mono text-xl text-comb"
            >
              {b.letter}
            </span>
            <div>
              <h2 className="font-display text-2xl">{b.title}</h2>
              <p className="mt-1 text-comb/80">{b.blurb}</p>
              <p className="mt-2 text-sm">
                <span className="font-mono uppercase tracking-widest text-propolis">
                  How to use ·{" "}
                </span>
                {b.howToUse}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
