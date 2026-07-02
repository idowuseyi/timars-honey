# 01 — Discovery Brief

> **Status: owner-confirmed.** Direction, audience, scope, stack, and success
> criteria below are answered by the owner (not assumed). Remaining unknowns are
> concrete *assets/credentials* needed before Implement, listed in *Inputs
> Required Before Implement* — they do not block the direction.

## Problem
Timars Honey is an established honey supply/sales business (10+ years) with **no
online store**. In its market the decisive purchase barrier is **trust**: up to
~28% of honey sold globally is adulterated, and this is widely cited as the top
threat to consumer confidence and brand credibility. Competitors already sell
honey online in Nigeria (Rehoboth Honey Store, A&Shine, Aga's, plus Jumia/Jiji).
So the site's job is to **convert a decade of offline trust into direct online
sales** — retail and wholesale — with authenticity/purity proof front and centre,
accepting real payments and arranging delivery. The platform is also **educative**:
it teaches customers the benefits of honey and how to use it, which reinforces
trust and gives non-buyers a reason to return.

The `design-asset/` reference (a Bioskin cosmeceuticals site) defines the
**layout taste** the owner likes (hero → product range → brand story →
distributor section → contact); the *functionality* is a full store, not a
brochure.

## Users & Context
- **Market:** **Nigeria (₦) is the default**; the store is **reachable globally**.
  NG delivery is the primary flow; international buyers can pay and then arrange
  shipping via WhatsApp (no automated international shipping in v1).
- **Retail consumers (equal priority):** individuals buying bottles/kegs for home
  use, health, and gifts; trust- and price-aware; mostly on mobile.
- **Wholesale / distributors (equal priority):** resellers buying kegs in bulk;
  onboarded via a **distributor application form**. Bulk pricing is implicit in
  the per-litre drop across sizes.
- **Context of use:** mobile-first, variable Nigerian mobile bandwidth; payment by
  card/transfer via Paystack (NG) or Flutterwave/Stripe (international); **WhatsApp
  (`+2347034632882`) is a parallel order/support channel**, not a replacement for
  online checkout.

## Requirements
1. **Full storefront:** catalogue → product page → cart → checkout → payment →
   order confirmation, with persisted **order** and basic **stock/availability**
   records.
2. **Editable catalogue (NOT hard-coded):** prices/products change over time with
   producers/logistics, so product data must be updatable **without a code
   deploy** (CMS/DB/config + a minimal admin or content workflow). v1 SKUs:
   | SKU | Size | Price (₦) |
   |---|---|---|
   | Biggy | 1 litre | 12,000 |
   | Big | 50 cl | 6,000 |
   | Keg A | 5 litres | 55,000 |
   | Keg C | 10 litres | 99,000 |
   | Keg B | 25 litres | 218,000 |
3. **Pluggable multi-gateway payments:** **Paystack is the default**; **Flutterwave
   and Stripe** activate automatically when their credentials are present, with no
   code change (config/env-driven). Region routing: NG → Paystack; international →
   Flutterwave/Stripe. **Every payment is confirmed server-side (webhook / verify
   API) before an order is marked paid** — never on a browser redirect.
4. **Courier integration:** live delivery rate + tracking for NG addresses via a
   recommended provider/aggregator (see Chosen Direction). International = pay
   online + arrange shipping over WhatsApp.
5. **Optional accounts:** guest checkout works fully; buyers may optionally register
   to save details and view order history.
6. **WhatsApp channel:** click-to-chat to `+2347034632882` present on every page.
7. **Wholesale path:** a **distributor application form** (captured/stored or
   emailed) plus keg-oriented bulk presentation.
8. **Trust-forward content:** an authenticity/purity story — farm-sourced, hygienic
   packaging, 10+ years supplying — presented prominently. **Health/medical claims
   ("used for wounds", "no side effects") must be worded as heritage/traditional-use
   or customer testimony, not unqualified medical fact** (NAFDAC/advertising risk;
   see critic WARN). Final wording is a GTM/content decision.
9. **Educational content (Honey Benefits):** an **auto-advancing carousel** on the
   homepage where each card shows one honey benefit **plus how to get/use it**
   (item is always honey), backed by a dedicated **"Honey Benefits A–Z"** page with
   the fuller alphabetical set (~26 entries, adjustable). Constraints:
   (a) **WCAG 2.2.2** — the carousel needs a visible pause/stop control and must
   pause on hover/keyboard focus; respect `prefers-reduced-motion`;
   (b) **claims safety** — benefit copy must be sourced and worded as general
   wellness/traditional use with a "not medical advice" note, and must **not**
   instruct applying edible honey to wounds/burns (evidence supports *medical-grade*
   honey only). Draft content proposed by the build, owner signs off.
10. **Brand:** use the owner's existing **logo**; **color palette and fonts to be
    proposed** in Design.
11. **Mobile-first, fast, SEO baseline:** legible at 360 px; unique titles/meta, Open
    Graph, sitemap.
12. **Deploy:** Next.js on **Cloudflare** (OpenNext adapter) at
    **`timarshoney.cerfic.com`** — a subdomain of the owner's existing paid
    Cloudflare domain `cerfic.com` — over HTTPS, pending a later move to a dedicated
    domain; CI `ship-gate` green.
13. **Migration-friendly boundaries:** keep commerce logic behind clean API
    boundaries so a future **Angular/Next + Rust backend** rebuild can reuse the
    contracts (owner's stated v2 vision).

## Success Criteria
Build-verifiable so Verify can convert each into an automated test:
1. **End-to-end paid order (primary):** a checkout completes and a **server-verified**
   Paystack payment creates a **persisted, paid** order record.
2. **Payment integrity:** an order is marked paid **only** after server-side
   verification; a spoofed client "success" with no valid webhook/verify does **not**
   produce a paid order.
3. **Gateway pluggability:** with only Paystack credentials set, Paystack is used;
   adding Flutterwave/Stripe credentials enables them **without code change** (proven
   by toggling env/config).
4. **Courier:** checkout retrieves a delivery rate for a NG address and stores a
   tracking reference, or degrades gracefully with a clear message.
5. **Editable catalogue:** all 5 SKUs render name, size, ₦ price, image, description;
   a price change takes effect **without a code deploy**.
6. **Accounts:** guest checkout completes end-to-end; optional registration persists a
   retrievable order history.
7. **Wholesale:** the distributor application form submits and the entry is captured
   (stored or emailed).
8. **Performance:** Lighthouse (mobile) performance ≥ 85 on home and product pages.
9. **Responsive:** no horizontal overflow and legible content at 360, 768, 1280 px.
10. **Accessibility:** 0 critical `axe-core` violations on home, product, and checkout.
11. **SEO baseline:** unique `<title>`/meta + valid Open Graph per page; `sitemap.xml`
    present.
12. **WhatsApp:** correct `wa.me/2347034632882` link on every page.
13. **Educational carousel:** auto-advances, exposes a keyboard-operable pause/stop
    control, pauses on hover/focus, and honours `prefers-reduced-motion`; each card
    renders a benefit + a "how to use" line. The **Benefits A–Z** page renders its
    full entry set, each with benefit + usage and a "not medical advice" note.
14. **Live:** deployed on Cloudflare over HTTPS at `timarshoney.cerfic.com`;
    `ship-gate` CI green.

## Options Considered
- **A — Off-the-shelf platform (Shopify/WooCommerce).** Fastest payments/inventory.
  *Con:* recurring cost, weaker fit for custom multi-gateway routing and the stated
  Next/Cloudflare + future-Rust path; less control.
- **B — Custom Next.js store on Cloudflare (CHOSEN).** Full control, pluggable
  gateways, matches the owner's stack and future migration path, low hosting cost.
  *Con:* most to build and secure — must not reinvent commerce primitives naively.
- **C — Headless commerce engine (e.g. Medusa/Saleor) + Next on Cloudflare.** Reuses
  battle-tested cart/order/stock/payment primitives behind Next. *Flagged for Plan*
  as a way to de-risk B without abandoning the stack.

## Chosen Direction
**Custom Next.js full store on Cloudflare (Option B), with a headless commerce
engine (Option C) to be evaluated in Plan** so cart/order/stock/payment security
isn't hand-rolled from zero. ₦-priced, NG-delivery-default but globally reachable;
retail + wholesale (distributor form); optional accounts; **pluggable, region-routed,
server-verified payments** (Paystack default; Flutterwave/Stripe on credentials);
courier aggregator for NG rates/tracking; WhatsApp as a parallel channel;
trust-forward brand story with careful health-claim wording; editable product/price
data. Commerce logic sits behind clean API boundaries to ease the future
Angular/Next + Rust rebuild.

### Out of Scope (v1)
True multi-currency pricing; automated international shipping rates (intl via
WhatsApp); subscriptions; loyalty/rewards; a full blog/CMS beyond the product,
story, and Honey Benefits A–Z content; native mobile app; the Rust backend (future
phase). A dedicated domain purchase is deferred — v1 lives on
`timarshoney.cerfic.com`.

### Inputs Required Before Implement (assets/credentials, not direction)
- Logo file; final product photos + descriptions.
- Payment credentials: Paystack (default) + Flutterwave/Stripe when available.
  **Pre-launch:** obtain a Paystack account in the **Timars Honey** business name
  (current account is usable for build/test only).
- Domain: **resolved** — use `timarshoney.cerfic.com` on the existing Cloudflare
  `cerfic.com`; only a DNS record + subdomain setup is needed (no purchase).
- Courier account once the provider is chosen in Plan.
- Sign-off on health-claim wording for trust content **and the Honey Benefits
  cards/A–Z page**.

## Sources

**Critic pass (adversarial self-review, 2026-07-02):** Grounding PASS · Internal
consistency PASS · Completeness PASS · Success criteria measurable PASS · Problem
validated vs. current market PASS · Scope explicit both ways PASS. Findings recorded
(none block the *direction*): **WARN** — health/medical claims (trust content *and*
the Honey Benefits cards/A–Z page) must be reworded as general-wellness/traditional
use with a "not medical advice" note and must not tell consumers to apply edible
honey to wounds/burns — evidence supports *medical-grade* honey only (Req. 8, 9);
**WARN** — the auto-advancing carousel must meet WCAG 2.2.2 (visible pause, pause on
hover/focus) and honour reduced-motion, or it fails the a11y criterion (Req. 9,
SC 13); **WARN** — payment account not in business name is build/test-only, get a
business-name Paystack before launch; **WARN** — do not hand-roll commerce
primitives; evaluate a headless engine in Plan (Option C). No BLOCK findings remain.
Owner adjustments incorporated 2026-07-02: educational Honey-Benefits carousel + A–Z
page (Req. 9), and domain `timarshoney.cerfic.com` on existing Cloudflare `cerfic.com`
(Req. 12).

<!-- One line per external fact: claim — source (URL/command) — date checked. -->
- Up to ~28% of honey sold globally may be adulterated; adulteration is a primary threat to consumer trust/brand credibility — gminsights.com honey authentication market report; marketbusinessinsights.com honey market — 2026-07-02.
- Nigeria honey demand rising (import surge); Africa honey consumption projected ~264K tons by 2035, Nigeria a key driver — indexbox.io Nigeria honey market report — 2026-07-02.
- Nigerian honey D2C competitors/channels (Rehoboth Honey Store online + 2–3 day delivery; A&Shine; Aga's; Jumia pay-on-delivery; Jiji; WhatsApp ordering) — honeystore.company.site, ashineltd.com, agaswholesome.com, jumia.com.ng/honey, jiji.ng — 2026-07-02.
- Next.js on Cloudflare: OpenNext Cloudflare adapter (@opennextjs/cloudflare) reached 1.0 GA Feb 2026, now the preferred deploy path; supports SSR/API routes/server actions/middleware on the Node runtime (needs nodejs_compat, compat date ≥ 2024-09-23); Next 15/16 supported (14 dropped Q1 2026) — developers.cloudflare.com/workers/framework-guides/web-apps/nextjs, opennext.js.org/cloudflare, blog.cloudflare.com — 2026-07-02.
- Payment gateways: Paystack, Flutterwave, Stripe all support server-side webhook verification (never fulfil on redirect); Paystack covers 6 African countries (NG/Ghana/SA/Kenya/Rwanda/Côte d'Ivoire), Flutterwave broadest (34 countries) and stronger for international/multi-currency, Stripe for global — jovistudio.com stripe-vs-paystack-vs-flutterwave; index.dev payment-processing comparison; smartsmssolutions.com payment-gateways — 2026-07-02.
- Nigerian courier APIs with rates/tracking: GIGL (direct API), Sendbox (aggregator), Shiip (aggregates 51 carriers incl. DHL/FedEx for international), Kwik (last-mile Lagos/Abuja) — giglogistics.com/developer, medium.com Shiip API article, ebrandpromotion.com delivery-APIs — 2026-07-02.
- GitHub Pages (noted for context; superseded by Cloudflare for this project): free for public repos, free custom domain + HTTPS — docs.github.com/en/pages — 2026-07-02.
- Honey health benefits — evidence-supported for wound care/antibacterial (medical-grade honey) and cough symptom relief, but "never apply regular kitchen honey to a burn or wound" and honey is ineffective for chronic leg ulcers; many consumer claims are unstandardised — healthline.com/nutrition/benefits-of-honey; ncbi.nlm.nih.gov/pmc/articles/PMC10346535; onlinelibrary.wiley.com/doi/full/10.1002/hsr2.70240 — 2026-07-02.
- WCAG 2.2.2 (Pause, Stop, Hide, Level A): content that auto-moves/updates for >5s must offer a mechanism to pause/stop/hide; carousels should show a visible pause control and pause on hover/focus (respecting prefers-reduced-motion is best practice) — w3.org WCAG / a11y-collective.com/blog/accessible-carousel — 2026-07-02.
- [unverified — from training data, as of 2026-07-02] NAFDAC regulates health/medical advertising claims for consumable products in Nigeria: general regulatory context, not a single cited primary source; confirm exact rules before publishing wound-care/"no side effects" claims.
- [unverified — from training data, as of 2026-07-02] Nigerian small-business commerce skews mobile-first and WhatsApp-centric: consistent with search results but not a single primary source.
