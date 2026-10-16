// Data access. Every function takes a `Db` so it runs unchanged on Neon (prod)
// and PGlite (tests). Money stays integer kobo end to end.
import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db/client";
import { products, orders, orderItems, distributorApplications } from "@/db/schema";
import { PRODUCTS, type Product } from "./products";
import type { Order } from "./orders";

/** Coerce untrusted input to a trimmed, length-capped string. */
const cap = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export interface OrderContact {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
}

/** Insert any seed product missing from the DB. Existing rows are left alone so a
 *  price or stock change made in the DB is never clobbered by a re-seed. */
export async function seedProducts(db: Db, seed: Product[] = PRODUCTS): Promise<void> {
  await db
    .insert(products)
    .values(
      seed.map((p) => ({
        slug: p.slug,
        name: p.name,
        sizeLabel: p.sizeLabel,
        sizeMl: p.sizeMl,
        priceKobo: p.priceKobo,
        description: p.description,
      })),
    )
    .onConflictDoNothing({ target: products.slug });
}

/** Active products, priced from the DB. Image paths still come from the static
 *  seed until R2 uploads land with admin CRUD. */
export async function loadCatalogue(db: Db): Promise<Product[]> {
  const rows = await db.select().from(products).where(eq(products.active, true));
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    sizeLabel: r.sizeLabel,
    sizeMl: r.sizeMl,
    priceKobo: r.priceKobo,
    description: r.description,
    image: PRODUCTS.find((p) => p.slug === r.slug)?.image ?? "",
  }));
}

/** Write a priced order and its line items atomically. Items snapshot name and
 *  unit price so later catalogue edits never rewrite order history. */
export async function persistOrder(db: Db, order: Order, contact: OrderContact): Promise<number> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(orders)
      .values({
        publicRef: order.ref,
        email: cap(contact.email, 254),
        phone: cap(contact.phone, 40),
        subtotalKobo: order.subtotalKobo,
        shippingKobo: order.shippingKobo,
        totalKobo: order.totalKobo,
        shipAddress: {
          name: cap(contact.name, 200),
          country: cap(contact.country, 100),
          state: cap(contact.state, 100),
          city: cap(contact.city, 100),
        },
      })
      .returning({ id: orders.id });

    const slugs = order.items.map((i) => i.slug);
    const found = await tx
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(and(inArray(products.slug, slugs), eq(products.active, true)));
    const idBySlug = new Map(found.map((p) => [p.slug, p.id]));

    const missing = slugs.filter((s) => !idBySlug.has(s));
    if (missing.length) throw new Error(`products not in DB: ${missing.join(", ")}`);

    await tx.insert(orderItems).values(
      order.items.map((i) => ({
        orderId: row.id,
        productId: idBySlug.get(i.slug)!,
        nameSnapshot: `${i.name} (${i.sizeLabel})`,
        unitPriceKobo: i.unitPriceKobo,
        qty: i.qty,
      })),
    );
    return row.id;
  });
}

export interface DistributorApplication {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  location?: string;
  monthlyVolume?: string;
  message?: string;
}

export async function saveDistributorApplication(
  db: Db,
  app: DistributorApplication,
): Promise<void> {
  // `app` arrives from a server action, i.e. untrusted client JSON. Copy only the
  // known fields so a caller can't set `status`, `id` or `createdAt`.
  const opt = (v: unknown, max: number) => cap(v, max) || null;
  await db.insert(distributorApplications).values({
    businessName: cap(app.businessName, 200),
    contactName: cap(app.contactName, 200),
    phone: cap(app.phone, 40),
    email: cap(app.email, 254),
    location: opt(app.location, 200),
    monthlyVolume: opt(app.monthlyVolume, 200),
    message: opt(app.message, 2000),
  });
}
