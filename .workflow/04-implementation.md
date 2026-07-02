# 04 — Implementation (build log)

Append-friendly log. Milestones **M0 (foundations) + M1 (catalogue) + M2 (cart +
checkout)** and the educative/trust/wholesale surface are built and green. Live
payments, shipping, auth, admin, and DB persistence are scaffolded via interfaces
but **not yet implemented** — tracked under *Status & remaining milestones*.

## Files Changed
Project scaffolded in place (Next.js 16.2.10, App Router, Tailwind v4, TypeScript).
- **Config:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `vitest.config.ts`, `drizzle.config.ts`, `open-next.config.ts`, `wrangler.jsonc`,
  `.env.example`, `.gitignore`.
- **Design system / brand ("Comb & Ledger"):** `app/globals.css` (tokens + `.hex`),
  `app/layout.tsx` (Fraunces / Hanken Grotesk / Spline Sans Mono via `next/font`),
  `components/SiteHeader.tsx`, `components/SiteFooter.tsx`, `components/TrustSeal.tsx`,
  `components/Hero.tsx`, `components/ProductCard.tsx`, `components/BenefitCarousel.tsx`.
- **Pages:** `app/page.tsx` (home), `app/shop/page.tsx`, `app/products/[slug]/page.tsx`
  (SSG per SKU), `app/benefits/page.tsx`, `app/wholesale/page.tsx` +
  `components/WholesaleForm.tsx`.
- **Domain / lib:** `lib/money.ts` (integer kobo), `lib/products.ts` (5 SKUs),
  `lib/benefits.ts` (A–H, claims-safe), `lib/whatsapp.ts`,
  `lib/payments/provider.ts` (`PaymentProvider` + `selectProvider`),
  `lib/shipping/provider.ts` (`ShippingProvider`), `db/schema.ts` (Drizzle/Postgres),
  `lib/cart.ts` (`buildOrderDraft` — server recomputes prices), `lib/orders.ts`.
- **Cart & checkout (M2):** `components/CartProvider.tsx` (localStorage, slug+qty only),
  `components/AddToCartButton.tsx`, `components/CartCount.tsx`, `app/cart/page.tsx`,
  `app/checkout/page.tsx`, `app/checkout/actions.ts` (`placeOrder` server action).
- **Tests:** money, catalogue, benefits (claims-safety), payments (`selectProvider`),
  orders (price-recompute / tamper-proof) — **21 passing**.

## Key Decisions
- **npm, not pnpm.** The environment's `pnpm` resolves to a Windows binary that
  panics under WSL; `check-gate.sh` defaults to npm, so the project uses npm
  (`package-lock.json`, no `pnpm-lock.yaml`).
- **Integer kobo everywhere** (`lib/money.ts` throws on non-integer) — no floats.
- **Provider selection is pure & unit-tested** (`selectProvider`) so gateway routing
  (NG→Paystack default; intl→enabled supporter) is verifiable without live SDKs.
- **Claims safety enforced by a test** (`benefits.test.ts` bans cure/treat/wound/…)
  — the NAFDAC risk from brief/design is now machine-guarded.
- **Static seed drives the storefront** (`lib/products.ts`); the DB schema exists and
  will become the source of truth at the admin/checkout milestone (prices editable
  without redeploy).
- **Placeholders, honestly labelled:** product images use a branded hex placeholder;
  "Add to cart" is disabled with "coming soon"; WhatsApp ordering works today so the
  site is usable now.

### Status & remaining milestones (Implement is NOT complete)
Done: M0 foundations, M1 catalogue (read-only), **M2 cart + checkout** (client cart,
server-recomputed totals, order placement → WhatsApp pay handoff), educative carousel
+ Benefits page, trust strip, wholesale enquiry (via WhatsApp), design system,
WhatsApp channel, CI-ready build + tests; verified by an HTTP smoke test (all routes
200, missing product 404). **Remaining before Verify:** M3 payments
(Paystack→Flutterwave/Stripe + webhooks/verify), M4 shipping (Terminal Africa), M5
optional accounts (Auth.js), admin CRUD + DB wiring/persistence (Neon), transactional
email, full A–Z content, real product photos, and the Cloudflare
(`timarshoney.cerfic.com`) deployment. These need owner credentials (see
`.env.example`).

## Deviations from Design
- **Checkout places an order but payment is a WhatsApp handoff** (M2): the cart→
  checkout→order path and server-side price recompute are real and tested; live card
  payment + DB persistence are M3. Shipping is ₦0 until the courier milestone.
- **Wholesale form composes a WhatsApp message** instead of writing to
  `distributor_applications` — DB capture lands with the DB-wiring milestone; no data
  is lost meanwhile.
- **Benefits seeded A–H** (not full A–Z) pending owner sign-off on wording.
- `db/schema.ts` uses Drizzle's array-form table extras (current idiom); otherwise
  matches the design schema exactly.

## How to Run
```bash
npm install            # deps (npm — NOT pnpm)
npm run dev            # local dev at http://localhost:3000
npm test               # vitest (15 tests)
npm run build          # production build (verified green)
cp .env.example .env.local   # then fill in secrets
npm run cf:deploy      # build + deploy to Cloudflare Workers (OpenNext) — needs creds
```

## Sources
<!-- One line per external fact: claim — source (URL/command) — date checked. -->
- Installed & verified: Next 16.2.10, React 19.2.4, Tailwind v4, drizzle-orm 0.45.2, @neondatabase/serverless 1.1.0, @opennextjs/cloudflare 1.20.1, drizzle-kit 0.31.10, vitest 4.1.9, wrangler 4.107.0 — package.json / npm ls — 2026-07-02.
- Build + tests green: `npm run build` (11 routes prerendered, TypeScript passed) and `npm test` (15 passed) — local run — 2026-07-02.
- next/font self-hosts Google Fonts (Fraunces, Hanken Grotesk, Spline Sans Mono) at build time — nextjs.org/docs/app/api-reference/components/font — 2026-07-02.
- OpenNext Cloudflare needs `nodejs_compat` + compatibility date ≥ 2024-09-23 (wrangler.jsonc set to 2024-12-30) — opennext.js.org/cloudflare — 2026-07-02.
