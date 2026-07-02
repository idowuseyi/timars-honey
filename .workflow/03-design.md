# 03 — Design

Concrete build design for the Timars Honey store, derived from `01-brief.md`
(requirements) and `02-plan.md` (architecture). Principle: **the simplest design
that meets the brief** — one Next.js app, client cart, MDX content, provider
Strategy only where the owner required pluggability. Money is always stored and
computed in **integer minor units (kobo)** — never floats.

## Components
Each unit: responsibility · how used · depends on.

1. **Design System / Brand** — tokens (color/type/space) + primitives (`Button`,
   `HexCard`, `ProductCard`, `TrustSeal`, `BenefitCarousel`, `Field`). Used by every
   page. *Depends: next/font.* (Visual spec in **UX / Flows**.)
2. **Storefront pages (RSC)** — Home, Shop (listing), Product, Cart, Checkout,
   Order Confirmation, Benefits A–Z, Story/Trust, Wholesale, Account. Render content
   + call server actions. *Depends: Catalog, Cart, Content, Design System.*
3. **Catalog** — read products/stock for storefront; CRUD from Admin. *Depends:
   Drizzle repos, R2 (images).*
4. **Cart** — client store (cookie/`localStorage`) holding `{productId, qty}` only;
   **prices are never trusted from the client** — recomputed server-side. *Depends:
   Catalog (server revalidation).*
5. **Checkout / Order service** — `placeOrder` use-case: recompute totals from DB,
   create `pending` order + items in one transaction. *Depends: Catalog, Shipping,
   Payment, Drizzle.*
6. **Payment module** — `PaymentProvider` interface + Paystack/Flutterwave/Stripe
   adapters + a **registry/selector** (enabled-by-credential, routed-by-country) +
   per-provider **webhook handlers**. *Depends: provider SDKs/REST, Order service.*
7. **Shipping module** — `ShippingProvider` interface + Terminal Africa adapter:
   rates at checkout, shipment + tracking after payment; intl → WhatsApp path.
   *Depends: Terminal Africa REST.*
8. **Auth** — Auth.js v5 (JWT/edge, split config). Guest checkout needs none;
   optional registration links a `customer`. *Depends: Drizzle adapter.*
9. **Admin** — protected `/admin`: CRUD products/prices/stock, view orders + update
   fulfilment, view distributor applications. *Depends: Auth (role=admin), Catalog,
   Order service.*
10. **Distributor** — wholesale application form → `distributor_applications` + email
    notify. *Depends: Drizzle, Notifications.*
11. **Content** — MDX/structured data for Benefits A–Z + Story; carries the
    "not medical advice" note. *Depends: Design System.*
12. **Notifications** — transactional email (order confirmation, distributor
    acknowledgement) via Resend. *Depends: Order service.*
13. **Infra bindings** — Drizzle repositories over Neon (via Hyperdrive/HTTP driver),
    R2 (images), KV (rate cache / idempotency hints). *Depends: Cloudflare bindings.*
14. **WhatsApp link builder** — `wa.me/2347034632882?text=…` with prefilled context
    (product, order ref, or intl-shipping enquiry). *Depends: —*

**Requirement coverage (brief → design):** R1 storefront→C2/C5; R2 editable catalogue
→C3/C9 + Data(`products`); R3 pluggable payments→C6; R4 courier→C7; R5 optional
accounts→C8; R6 WhatsApp→C14; R7 wholesale→C10; R8 trust content→C11; R9 educational
carousel→C1/C2/C11; R10 SEO/perf→C2 (RSC + next/font); R11 mobile-first→Design System;
R12 deploy→Infra; R13 migration boundaries→C6/C7 interfaces + repos.

## Interfaces & Contracts

**Money & currency.** All amounts are integer **kobo** (`₦1 = 100 kobo`),
`currency = 'NGN'`. Display formats to `₦` at the edge only.

**PaymentProvider (domain interface — the Rust-migration contract):**
```ts
interface PaymentProvider {
  id: 'paystack' | 'flutterwave' | 'stripe'
  isEnabled(): boolean                       // credentials present in env
  supportsCountry(code: string): boolean     // NG→paystack; else flutterwave/stripe
  // returns a redirect URL (Paystack/FW) or client secret (Stripe) + our order ref
  initialize(o: { orderRef: string; amountKobo: number; email: string; currency: 'NGN' })
    : Promise<{ reference: string; redirectUrl?: string; clientSecret?: string }>
  verify(reference: string)
    : Promise<{ status: 'success'|'failed'|'pending'; amountKobo: number; currency: string }>
  verifyWebhook(rawBody: string, headers: Record<string,string>)
    : { valid: boolean; event?: string; reference?: string }
}
```
**Selector:** `selectProvider(country, override?) → PaymentProvider` — filter
`isEnabled()`, then first that `supportsCountry`; **Paystack is the default** when
enabled. If none enabled → checkout blocks with an admin-visible error.
*Merchant-reality caveat:* for a **Nigeria-registered** business the practical
international route is **Flutterwave** (accepts international cards, settles NGN in
NG); **Stripe** needs a supported-country entity and therefore stays
credential-gated/optional (enabled only if valid Stripe creds are supplied). This
is already how the registry behaves — no code change, just don't treat Stripe as
the assumed intl default.

**Provider webhook verification (verified 2026-07-02):**
- **Paystack** — `x-paystack-signature` = `HMAC_SHA512(rawBody, PAYSTACK_SECRET)`;
  init `POST /transaction/initialize`, confirm `GET /transaction/verify/:reference`;
  respond `200` promptly (retries otherwise).
- **Flutterwave (v3)** — `flutterwave-signature` = `HMAC_SHA256(rawBody, SECRET_HASH)`
  (legacy plain `verif-hash` compare also accepted); confirm
  `GET /v3/transactions/:id/verify`.
- **Stripe** — `Stripe-Signature` (HMAC-SHA256 + timestamp) via
  `stripe.webhooks.constructEvent`; confirm the `payment_intent`/`checkout.session`.

**ShippingProvider:**
```ts
interface ShippingProvider {
  getRates(i: { toCountry: string; toState: string; toCity: string; parcels: Parcel[] })
    : Promise<Rate[]>                              // { carrier, service, amountKobo, eta }
  createShipment(orderRef: string, rateId: string): Promise<{ trackingRef: string }>
  track(trackingRef: string): Promise<{ status: string; checkpoints: Checkpoint[] }>
}
```
Terminal Africa adapter → `POST /v1/rates/...` (country/state/city for rate-only).

**Server actions / route handlers:**
- `placeOrder(cart, contact, addr) → { orderRef }` (server recomputes totals).
- `initPayment(orderRef) → { redirectUrl | clientSecret }`.
- `getShippingRates(addr, cart) → Rate[]`.
- `POST /api/webhooks/{paystack|flutterwave|stripe}` — verify → mark paid (idempotent).
- `GET /api/payments/return?ref=` — redirect fallback that **re-verifies** (never
  trusts the redirect alone).
- `submitDistributor(form)`, admin CRUD under `/admin/*`.

**Order state machine:** `pending → awaiting_payment → paid → fulfilling →
shipped → delivered`; side states `payment_failed`, `cancelled`, `refunded`.
Only a **server-verified** payment moves `awaiting_payment → paid`.

## Data
Drizzle/Postgres (Neon). Key tables (money = `*_kobo` integers):
- **products**: `id, slug (uniq), name, size_label, size_ml, price_kobo, currency,
  description, image_r2_key, stock_qty, active, created_at, updated_at`.
- **customers**: `id, email (uniq), name, phone, auth_id (nullable), created_at`.
- **orders**: `id, public_ref (uniq), customer_id (null=guest), email, phone,
  status, subtotal_kobo, shipping_kobo, total_kobo, currency, ship_address (jsonb),
  provider, provider_ref, created_at`.
- **order_items**: `id, order_id, product_id, name_snapshot, unit_price_kobo, qty`
  (snapshot price at order time).
- **payments**: `id, order_id, provider, provider_ref (uniq), status, amount_kobo,
  raw (jsonb), verified_at` — **`provider_ref` UNIQUE enforces webhook idempotency**.
- **shipments**: `id, order_id, provider, tracking_ref, rate_snapshot (jsonb),
  status`.
- **distributor_applications**: `id, business_name, contact_name, phone, email,
  location, monthly_volume, message, status, created_at`.
Seed: the 5 SKUs from the brief (Biggy 1 L ₦12,000 … Keg B 25 L ₦218,000) as
`price_kobo` integers. Content (Benefits A–Z, Story) lives in versioned MDX, not DB.

## UX / Flows

### Brand / Visual Direction (proposal for gate approval)
Direction **"Comb & Ledger"** — a dark, premium *jar-label* aesthetic that rejects
the cream-serif honey cliché; trust rendered as a verifiable ledger.

- **Palette (named hexes):** `--comb #241A10` (deep roasted brown — hero/dark
  surfaces, text), `--bark #3A2A18` (secondary dark surface), `--honey #E39A1B`
  (primary gold), `--pollen #F6C445` (bright CTA highlight), `--propolis #46603F`
  (botanical green — trust badges, the farm/natural differentiator), `--wax #F7EEDB`
  (warm light sections). Contrast checked for WCAG AA on text pairings.
- **Type:** display **Fraunces** (organic soft-axis serif, used with restraint);
  body **Hanken Grotesk**; utility/mono **Spline Sans Mono** for prices, batch codes,
  A–Z letters, and the trust seal. Self-hosted via `next/font`.
- **Signature:** the **honeycomb hex cell** as the frame for A–Z benefit cards and
  product cards (geometry = the product), plus a mono **Traceability Seal**
  (`EST. · FARM-SOURCED · BATCH`) repeated as the brand's trust stamp.
- **Motion:** one orchestrated moment — a slow honey-drip / comb-reveal on hero load;
  everything else quiet. **Respects `prefers-reduced-motion`.**

```
HERO (dark --comb)                     BENEFIT CAROUSEL (hex cells)
┌──────────────────────────────┐      ┌───────────────────────────┐
│ ⬡ TIMARS · EST. ▸ ledger seal│      │  ⬡A   ⬡B   ⬡C   ⟨▮ pause⟩ │
│ Fraunces headline: purity    │      │  benefit + "how to use"   │
│ [Shop] [Learn the benefits]  │      │  auto-advance, pausable   │
│ honey-drip motion · jar img  │      └───────────────────────────┘
└──────────────────────────────┘      PRODUCT CARD: hex frame, name,
                                       ₦price (mono), size, [Add]
```

### Primary flows
1. **Buy (retail):** Shop → Product → Add (client cart) → Checkout (guest or
   optional sign-in) → enter address → **getShippingRates** → pick rate →
   **placeOrder** (server totals) → **initPayment** (provider by country) → pay →
   webhook verify → `paid` → confirmation + email. NG default; **international** →
   pay → confirmation instructs WhatsApp to arrange shipping.
2. **Learn (educative):** Home carousel (hex, auto+pause) → Benefits A–Z page.
3. **Wholesale:** Wholesale page → distributor form → stored + email ack.
4. **Admin:** sign-in (role=admin) → edit price/stock (effective immediately) →
   view/fulfil orders → read distributor applications.

## Error Handling
Primary failure modes → handling:
- **Webhook missing/late** → the return URL and an admin action both call
  `verify(reference)`; order only becomes `paid` on a `success` verify. Idempotent.
- **Duplicate webhook** → `payments.provider_ref` UNIQUE + status guard; second
  delivery is a no-op `200`.
- **Invalid signature** → `401`, log, do nothing.
- **Stock race / oversell** → decrement with a conditional update
  (`stock_qty = stock_qty - qty WHERE stock_qty >= qty`) inside the order
  transaction; if it fails, mark order `payment_failed`/refund path and notify.
- **Price changed mid-checkout** → totals recomputed at `placeOrder` *and* re-checked
  at `initPayment`; on delta, show the change and require re-confirm before paying.
- **Shipping API down** → fall back to a configured flat NG rate + a banner, or route
  to WhatsApp; never block the sale silently.
- **No payment provider enabled** → checkout disabled with a clear message; admin
  alerted (config error, not customer fault).
- **DB connection exhaustion (Workers)** → Hyperdrive/HTTP-driver pooling + bounded
  retries with backoff.
- **Missing product image** → hex placeholder; page still valid.
- **Edge auth** → JWT session strategy; middleware uses the split (adapter-less)
  config.

## Sources

**Critic pass (adversarial self-review, 2026-07-02):** Every component has one
responsibility + interface PASS · primary failure modes handled PASS · requirement
coverage R1–R13 mapped PASS · simplest-design-that-meets-brief PASS (one app, client
cart, MDX, integer money; Strategy only where the owner required it). Findings, all
resolved/recorded (no BLOCK): **WARN** — Stripe is impractical for a NG-registered
merchant; Flutterwave is the real intl path and Stripe stays credential-gated (noted
in the selector caveat); **WARN** — transactional email (Resend) is the one addition
not explicitly in the brief; kept minimal (order confirmation + distributor ack) and
can fall back to on-screen + WhatsApp if the owner prefers. No BLOCK findings remain.

<!-- One line per external fact: claim — source (URL/command) — date checked. -->
- Paystack webhooks: `x-paystack-signature` = HMAC-SHA512(rawBody, secret_key); init `POST /transaction/initialize`, verify `GET /transaction/verify/:reference`; respond 200 promptly — paystack.com/docs/payments/webhooks — 2026-07-02.
- Flutterwave (v3 current; v4 in beta): webhook `flutterwave-signature` = HMAC-SHA256 with dashboard secret hash (legacy plain `verif-hash` also used); verify `GET /v3/transactions/:id/verify` — developer.flutterwave.com/docs/webhooks, developer.flutterwave.com/v3.0/docs/transaction-verification — 2026-07-02.
- Terminal Africa TShip get-rates: `POST /v1/rates/...` needs parcel_id + pickup/delivery address (country/state/city sufficient for rate-only); aggregates DHL/FedEx/UPS/Aramex — docs.terminal.africa/tship/rate/get-rates-for-shipment — 2026-07-02.
- Auth.js v5 edge pattern: JWT session strategy + split config (adapter-less config for edge middleware; full config with Drizzle adapter in Node routes) — authjs.dev/getting-started/migrating-to-v5, authjs.dev/reference/nextjs — 2026-07-02.
- Fraunces, Hanken Grotesk, Spline Sans Mono are open-source Google Fonts, self-hostable via `next/font` (perf) — fonts.google.com; nextjs.org/docs/app/api-reference/components/font — 2026-07-02.
- [verified pattern, not re-fetched 2026-07-02] Stripe webhooks use `Stripe-Signature` (HMAC-SHA256 + timestamp) verified via `stripe.webhooks.constructEvent` — stripe.com/docs/webhooks; confirm exact API version at Implement.
- [unverified — from training data, as of 2026-07-02] Resend as the transactional-email provider and Cloudflare Hyperdrive Postgres pooling specifics: confirm limits/quotas at Implement.
