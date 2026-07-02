"use client";

import { useEffect, useRef, useState } from "react";
import { BENEFITS, BENEFITS_DISCLAIMER } from "@/lib/benefits";

const INTERVAL_MS = 5000;

// Auto-advancing carousel that meets WCAG 2.2.2: a visible Pause control,
// pauses on hover/focus, and does not auto-advance under prefers-reduced-motion.
export function BenefitCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const hovering = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (!hovering.current) setIndex((i) => (i + 1) % BENEFITS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing]);

  const go = (n: number) => setIndex((n + BENEFITS.length) % BENEFITS.length);
  const current = BENEFITS[index];
  const ctrl =
    "flex h-9 w-9 items-center justify-center rounded-full border border-comb/20 text-comb transition-colors hover:border-honey hover:text-honey";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Benefits of honey"
      className="bg-wax"
    >
      <div
        className="mx-auto max-w-4xl px-4 py-16"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
        onFocusCapture={() => (hovering.current = true)}
        onBlurCapture={() => (hovering.current = false)}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl">Why honey?</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => go(index - 1)} aria-label="Previous benefit" className={ctrl}>
              ‹
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={!playing}
              className="rounded-full border border-comb/20 px-4 py-1.5 text-sm font-semibold text-comb transition-colors hover:border-honey hover:text-honey"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button onClick={() => go(index + 1)} aria-label="Next benefit" className={ctrl}>
              ›
            </button>
          </div>
        </div>

        <div aria-live="polite" className="mt-8">
          <article className="rounded-3xl border border-comb/10 bg-white p-8">
            <div className="flex items-start gap-5">
              <span
                aria-hidden
                className="hex flex h-16 w-16 shrink-0 items-center justify-center bg-honey font-mono text-2xl text-comb"
              >
                {current.letter}
              </span>
              <div>
                <h3 className="font-display text-2xl">{current.title}</h3>
                <p className="mt-2 text-comb/80">{current.blurb}</p>
                <p className="mt-3 text-sm">
                  <span className="font-mono uppercase tracking-widest text-propolis">
                    How to use ·{" "}
                  </span>
                  {current.howToUse}
                </p>
              </div>
            </div>
          </article>
          <p className="mt-3 text-xs text-comb/50">{BENEFITS_DISCLAIMER}</p>
        </div>

        <ol className="mt-6 flex flex-wrap gap-1.5" aria-label="Choose a benefit">
          {BENEFITS.map((b, i) => (
            <li key={b.letter}>
              <button
                onClick={() => go(i)}
                aria-label={`Show benefit ${b.letter}: ${b.title}`}
                aria-current={i === index}
                className={`hex flex h-8 w-8 items-center justify-center font-mono text-xs transition-colors ${
                  i === index ? "bg-honey text-comb" : "bg-comb/10 text-comb/60 hover:bg-comb/20"
                }`}
              >
                {b.letter}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
