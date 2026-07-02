# 02 — Plan / Architecture

Derived from `01-brief.md` (owner-approved). Scope: a trust-led, educative **full
online honey store** — Next.js on Cloudflare, pluggable server-verified payments,
courier rates/tracking, optional accounts, editable catalogue, Honey-Benefits
carousel + A–Z, on `timarshoney.cerfic.com`.

## Work Breakdown
Independently shippable pieces (ID, description, depends-on):

- **WB1 — Foundations & deploy pipeline.** Next.js 16 (App Router) scaffold +
  `@opennextjs/cloudflare` + Cloudflare Workers project + `ship-gate` CI green +
  `timarshoney.cerfic.com` DNS/subdomain on existing Cloudflare `cerfic.com`.
  *depends: —*
- **WB2 — Data layer.** Neon Postgres + Drizzle schema & migrations: `products`,
  `stock`, `orders`, `order_items`, `customers`, `distributor_applications`,
  `payments`, `shipments`. *depends: WB1*
- **WB3 — Catalogue + editable admin.** Public product listing/detail read from DB;
  protected `/admin` to CRUD products/prices/stock and view orders + distributor
  applications (satisfies "edit prices without a redeploy"). *depends: WB2*
- **WB4 — Cart & checkout.** Client cart (cookie/local), checkout form, address,
  delivery selection; server **recomputes totals from DB** (never trusts client
  price); creates `pending` order. *depends: WB3*
- **WB5 — Payments abstraction + providers.** `PaymentProvider` strategy; Paystack
  (default), Flutterwave, Stripe enabled by credential presence; region routing
  (NG→Paystack, intl→Flutterwave/Stripe); init → pay → **idempotent webhook +
  server verify** → mark paid → decrement stock. *depends: WB4*
- **WB6 — Shipping/courier.** `ShippingProvider` strategy over Terminal Africa
  (TShip): live NG rates at checkout + tracking ref; international = pay + arrange
  via WhatsApp. *depends: WB4*
- **WB7 — Optional accounts.** Auth.js v5 (JWT/edge): guest checkout always works;
  optional registration → saved details + order history. *depends: WB2*
- **WB8 — Educational content.** Homepage **auto-advancing Honey-Benefits carousel**
  (WCAG 2.2.2 pause/controls + `prefers-reduced-motion`) + **Benefits A–Z** page;
  content as versioned MDX/structured data with "not medical advice" note.
  *depends: WB1*
- **WB9 — Trust/brand + wholesale.** Story/purity pages; **distributor application
  form** captured to DB/email. *depends: WB2*
- **WB10 — Design system.** Layout/components using the owner's logo + the
  palette/fonts chosen in Phase 03 (Design owns the look; this wires it in).
  *depends: WB1, 03-design*
- **WB11 — Hardening & acceptance tests.** SEO (titles/meta/OG/sitemap), perf, a11y;
  Vitest + Playwright + axe-core + Lighthouse CI mapping every `01-brief` success
  criterion. *depends: all*
- **WB12 — WhatsApp channel.** `wa.me/2347034632882` click-to-chat with prefilled
  context, present site-wide. *depends: WB1*

## Architecture
**One Next.js 16 App-Router application** deployed to **Cloudflare Workers** via the
OpenNext adapter — it serves both the storefront (React Server Components) and the
backend (Route Handlers + Server Actions). Layered with deliberate seams so the
future **Angular/Next + Rust backend** can re-implement them:

- **Presentation** — RSC pages + client components (cart, carousel, checkout). Cart
  state client-side; all money/stock decisions server-side.
- **Application (use-cases)** — Server Actions / Route Handlers: `placeOrder`,
  `initPayment`, `handlePaymentWebhook`, `getShippingRates`, `submitDistributor`.
- **Domain** — plain TypeScript: `Order`, `Cart`, `Product`, and the
  **`PaymentProvider`** & **`ShippingProvider`** strategy interfaces. No framework
  or vendor types leak in here — this is the contract a Rust backend would mirror.
- **Infrastructure** — Drizzle repositories over Neon Postgres; provider adapters
  (Paystack/Flutterwave/Stripe, Terminal Africa); Cloudflare bindings (**R2** for
  product images, **KV** for cache/session hints, **Hyperdrive** or Neon HTTP driver
  for pooled Postgres access).

**Critical flows.**
- *Checkout/payment:* create `pending` order with **server-recomputed** totals →
  `PaymentProvider.initialize()` → user pays → provider **webhook** (signature-
  verified, **idempotent**) confirms via the provider's verify API → order `paid`,
  stock decremented **in one Postgres transaction** → confirmation + optional
  shipment creation. A browser "success" redirect **never** marks an order paid on
  its own.
- *Provider selection:* config-driven — a provider is enabled only if its
  credentials exist; destination decides routing (NG→Paystack default; else
  Flutterwave/Stripe). Same shape for couriers.
- *Editable pricing:* admin writes to `products`; checkout reads live from DB, so a
  price change is effective immediately with no deploy.

## Tech Choices
One-line justification each (versions/facts in `## Sources`, checked 2026-07-02):
- **Next.js 16 (App Router)** — owner's stack; RSC + Route Handlers cover front and
  back in one deployable; current stable 16.2.7.
- **@opennextjs/cloudflare (OpenNext 1.0 GA)** — Cloudflare's preferred way to run
  full Next (SSR, Route Handlers, middleware) on Workers.
- **Cloudflare Workers + R2 + KV (+ Hyperdrive)** — owner's host; R2 for images, KV
  for cache, Hyperdrive to pool Postgres connections from the edge.
- **Neon serverless Postgres** — relational integrity + real transactions for
  order/stock; HTTP/WebSocket drivers work on Workers; eases the future Rust+Postgres
  backend.
- **Drizzle ORM** — native on Workers over HTTP drivers, ~60KB, SQL-first, typed
  migrations; the 2026 serverless default (Prisma needs Accelerate/proxy at edge).
- **Auth.js v5 (JWT + split config)** — open-source optional accounts, App-Router
  support, edge-capable; no per-MAU fee. *(Better Auth noted as an alternative to
  confirm in Design.)*
- **Payments: Paystack (default) + Flutterwave + Stripe** behind a strategy — all
  support server-side webhook verification; Paystack strong for NG, Flutterwave for
  broader Africa/intl, Stripe global.
- **Shipping: Terminal Africa (TShip)** behind a strategy — one API for DHL/FedEx/UPS
  domestic + international rates, pickup, tracking. *(Shiip = fallback aggregator.)*
- **Content: MDX/structured data** for Benefits A–Z + story — versioned, SEO-friendly,
  easy claim review; **products stay in DB** (change often).
- **Testing: Vitest + Playwright + axe-core + Lighthouse CI** — maps each success
  criterion to an automated check for Verify.

## Sequence & Milestones
- **M0 Foundations** (WB1, WB2): app deploys to `timarshoney.cerfic.com`, CI green,
  DB connected. *Exit: a blank page live + migrations run.*
- **M1 Catalogue + admin** (WB3): 5 SKUs render; prices editable via `/admin`.
- **M2 Cart + checkout skeleton** (WB4): guest checkout to a `pending` order (no
  payment yet).
- **M3 Payments** (WB5): Paystack end-to-end with server verification; then
  Flutterwave/Stripe via the same interface. *Exit: success criterion #1 & #2.*
- **M4 Shipping** (WB6): NG rates + tracking at checkout; intl→WhatsApp.
- **M5 Accounts** (WB7): optional register + order history; guest still works.
- **M6 Educational + trust + wholesale** (WB8, WB9, WB12): carousel (a11y), Benefits
  A–Z, story, distributor form, WhatsApp.
- **M7 Design polish + hardening** (WB10, WB11): brand system applied, SEO/perf/a11y,
  full acceptance suite green → ready for Verify.

## Risks
- **R1 Workers runtime limits** (no long-running processes, CPU caps) — keep handlers
  short/async; idempotent webhooks; offload any heavy work to Queues/Durable Objects.
- **R2 Payment spoofing** — server-side verify + signature check + idempotency; never
  fulfil on redirect (pinned by success criterion #2).
- **R3 Price integrity with editable catalogue** — recompute all totals server-side
  from DB at checkout; client price is display-only.
- **R4 Health-claim/NAFDAC risk** (trust content + Benefits A–Z) — wellness/traditional
  wording, "not medical advice", no wound-application of edible honey; owner/legal
  sign-off before publish.
- **R5 Carousel a11y (WCAG 2.2.2)** — build visible pause + hover/focus-pause +
  reduced-motion from the start; axe + manual test.
- **R6 Neon-from-Workers connection exhaustion** — use Neon HTTP driver or Cloudflare
  Hyperdrive pooling; watch latency/cold start.
- **R7 Payment account not in business name** — build/test only; obtain a
  Timars-Honey-named Paystack (KYC/settlement/merchant-name) before real-money launch.
- **R8 Future Rust migration lock-in** — isolate domain + Strategy/repository
  interfaces from Next/Cloudflare specifics so v2 reuses the contracts.
- **R9 Edge auth complexity** — Auth.js JWT/split-config (or Better Auth); accounts are
  optional so this never blocks checkout.
- **R10 International shipping scope creep** — explicitly WhatsApp-mediated in v1;
  `ShippingProvider` keeps automation possible later.

## Sources
<!-- One line per external fact: claim — source (URL/command) — date checked. -->
- Next.js current stable **16.2.7** (June 2026), Turbopack default, React 19.2, Node ≥ 20; Next 16 GA Oct 2025 — nextjs.org/blog/next-16, nextjs.org/blog/next-16-2, github.com/vercel/next.js/releases — 2026-07-02.
- OpenNext Cloudflare adapter (`@opennextjs/cloudflare`) 1.0 GA Feb 2026; preferred full-Next-on-Workers path (SSR/Route Handlers/middleware; Node runtime, `nodejs_compat`) — developers.cloudflare.com/workers/framework-guides/web-apps/nextjs, opennext.js.org/cloudflare — 2026-07-02.
- Cloudflare does **not** host Postgres/MySQL; storage = D1/R2/KV/Durable Objects; external Postgres via **Hyperdrive** pooling — northflank.com/blog/railway-vs-cloudflare; developers.cloudflare.com/hyperdrive — 2026-07-02.
- **Medusa v2 requires Postgres + Redis + a long-running Node backend** → Railway-style host, not Workers (hence rejected for this Cloudflare-hosted v1) — railway.com/deploy/medusa, docs.medusajs.com/learn/deployment/general — 2026-07-02.
- Drizzle ORM runs natively on Cloudflare Workers/edge over HTTP drivers (`@neondatabase/serverless`, D1); ~60KB; ~900k weekly downloads; default serverless choice 2026 — orm.drizzle.team/docs/connect-neon, developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/…/drizzle-orm, github.com/drizzle-team/drizzle-orm — 2026-07-02.
- Auth.js v5 (formerly NextAuth) stable since late 2024; min Next 14; edge needs split-config + JWT; adapters under `@auth/*-adapter`; project now associated with Better Auth — authjs.dev/getting-started/migrating-to-v5, blog.logrocket.com/best-auth-library-nextjs-2026 — 2026-07-02.
- Payment gateways support server-side webhook verification (never fulfil on redirect); Paystack = NG/6 African countries, Flutterwave = broad Africa/intl (34), Stripe = global — jovistudio.com/blog/stripe-vs-paystack-vs-flutterwave, index.dev payment-processing comparison — 2026-07-02.
- Terminal Africa **TShip** API = single interface to DHL/FedEx/UPS/Aramex for rates, pickup, tracking (domestic + international); Shiip aggregates 51 NG carriers with API — docs.terminal.africa/tship, terminal.africa/tship-api, medium.com Shiip API — 2026-07-02.
- Honey benefits evidence-bounded: wound care/antibacterial (medical-grade) + cough relief supported; "never apply regular kitchen honey to a burn/wound"; ineffective for chronic leg ulcers — healthline.com/nutrition/benefits-of-honey, ncbi.nlm.nih.gov/pmc/articles/PMC10346535 — 2026-07-02.
- WCAG 2.2.2 (Pause, Stop, Hide, Level A): auto-moving content > 5s needs a pause/stop/hide mechanism; carousels should show a visible pause control and pause on hover/focus — a11y-collective.com/blog/accessible-carousel, w3.org WCAG — 2026-07-02.
- [unverified — from training data, as of 2026-07-02] Better Auth as an Auth.js alternative and NAFDAC health-advertising rules: directional context, confirm specifics in Design/GTM.
