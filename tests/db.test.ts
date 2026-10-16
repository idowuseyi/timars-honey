import { describe, it, expect, beforeEach } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Db } from "../db/client";
import {
  seedProducts,
  loadCatalogue,
  persistOrder,
  saveDistributorApplication,
} from "../lib/repo";
import { createOrder } from "../lib/orders";
import { PRODUCTS } from "../lib/products";

// Real Postgres (PGlite, in-process WASM) with the real migrations applied, so the
// SQL these tests exercise is the SQL that runs on Neon.
let db: Db;

beforeEach(async () => {
  const pg = drizzle(new PGlite(), { schema });
  await migrate(pg, { migrationsFolder: "./db/migrations" });
  db = pg as unknown as Db;
});

const contact = {
  name: "Ada",
  email: "ada@example.com",
  phone: "+2348000000000",
  country: "NG",
  state: "Lagos",
  city: "Ikeja",
};

describe("seedProducts", () => {
  it("inserts the seed catalogue and is idempotent", async () => {
    await seedProducts(db);
    await seedProducts(db);
    const rows = await db.select().from(schema.products);
    expect(rows).toHaveLength(PRODUCTS.length);
  });

  it("does not overwrite a price edited in the DB", async () => {
    await seedProducts(db);
    await db
      .update(schema.products)
      .set({ priceKobo: 650_000 })
      .where(eq(schema.products.slug, "big-50cl"));
    await seedProducts(db);
    const [row] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, "big-50cl"));
    expect(row.priceKobo).toBe(650_000);
  });
});

describe("loadCatalogue", () => {
  it("returns active products with their DB price", async () => {
    await seedProducts(db);
    await db
      .update(schema.products)
      .set({ active: false })
      .where(eq(schema.products.slug, "keg-b-25l"));
    const cat = await loadCatalogue(db);
    expect(cat.map((p) => p.slug)).not.toContain("keg-b-25l");
    expect(cat.find((p) => p.slug === "biggy-1l")?.priceKobo).toBe(1_200_000);
  });
});

describe("persistOrder", () => {
  it("writes the order and its items with price snapshots", async () => {
    await seedProducts(db);
    const order = createOrder(
      [
        { slug: "biggy-1l", qty: 2 },
        { slug: "big-50cl", qty: 1 },
      ],
      { ref: "TH-T1" },
    );
    await persistOrder(db, order, contact);

    const [row] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.publicRef, "TH-T1"));
    expect(row.status).toBe("pending");
    expect(row.totalKobo).toBe(3_000_000);
    expect(row.email).toBe("ada@example.com");
    expect(row.shipAddress).toMatchObject({ city: "Ikeja", state: "Lagos" });

    const items = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, row.id));
    expect(items).toHaveLength(2);
    expect(items.reduce((s, i) => s + i.unitPriceKobo * i.qty, 0)).toBe(3_000_000);
  });

  it("rolls back the whole order if an item cannot be written", async () => {
    // No seed → products table is empty → item insert fails → no orphan order.
    const order = createOrder([{ slug: "biggy-1l", qty: 1 }], { ref: "TH-T2" });
    await expect(persistOrder(db, order, contact)).rejects.toThrow();
    const rows = await db.select().from(schema.orders);
    expect(rows).toHaveLength(0);
  });
});

describe("saveDistributorApplication", () => {
  it("stores an enquiry with status new", async () => {
    await saveDistributorApplication(db, {
      businessName: "Ikeja Mart",
      contactName: "Bola",
      phone: "+2348011111111",
      email: "bola@example.com",
      monthlyVolume: "10 × 25L",
      message: "Interested",
    });
    const [row] = await db.select().from(schema.distributorApplications);
    expect(row.businessName).toBe("Ikeja Mart");
    expect(row.status).toBe("new");
  });

  it("ignores fields the client should not control", async () => {
    await saveDistributorApplication(db, {
      businessName: "Sneaky Ltd",
      contactName: "X",
      phone: "1",
      email: "x@example.com",
      status: "approved",
      id: 999,
    } as never);
    const [row] = await db.select().from(schema.distributorApplications);
    expect(row.status).toBe("new");
    expect(row.id).not.toBe(999);
  });
});
