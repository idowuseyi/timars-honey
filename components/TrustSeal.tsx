// The mono "traceability seal" — the repeated trust stamp (03-design signature).
export function TrustSeal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-propolis ${className}`}
    >
      <span aria-hidden>⬡</span>
      Est. · Farm-sourced · Batch-traceable
    </span>
  );
}
