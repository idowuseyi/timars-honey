// Postgres schema (Neon) via Drizzle. Money columns are integer *_kobo. The store
// is wired to this in the catalogue/checkout milestones; the seed comes from
// lib/products.ts. See 03-design.md "Data".
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sizeLabel: text("size_label").notNull(),
  sizeMl: integer("size_ml").notNull(),
  priceKobo: integer("price_kobo").notNull(),
  currency: text("currency").notNull().default("NGN"),
  description: text("description").notNull().default(""),
  imageR2Key: text("image_r2_key"),
  stockQty: integer("stock_qty").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  authId: text("auth_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  publicRef: text("public_ref").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("pending"),
  subtotalKobo: integer("subtotal_kobo").notNull(),
  shippingKobo: integer("shipping_kobo").notNull().default(0),
  totalKobo: integer("total_kobo").notNull(),
  currency: text("currency").notNull().default("NGN"),
  shipAddress: jsonb("ship_address"),
  provider: text("provider"),
  providerRef: text("provider_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  nameSnapshot: text("name_snapshot").notNull(),
  unitPriceKobo: integer("unit_price_kobo").notNull(),
  qty: integer("qty").notNull(),
});

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    provider: text("provider").notNull(),
    providerRef: text("provider_ref").notNull(),
    status: text("status").notNull().default("pending"),
    amountKobo: integer("amount_kobo").notNull(),
    raw: jsonb("raw"),
    verifiedAt: timestamp("verified_at"),
  },
  (t) => [
    // Unique provider reference = webhook idempotency (design "Error Handling").
    uniqueIndex("payments_provider_ref_unique").on(t.providerRef),
  ],
);

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  provider: text("provider").notNull(),
  trackingRef: text("tracking_ref"),
  rateSnapshot: jsonb("rate_snapshot"),
  status: text("status").notNull().default("pending"),
});

export const distributorApplications = pgTable("distributor_applications", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  location: text("location"),
  monthlyVolume: text("monthly_volume"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
