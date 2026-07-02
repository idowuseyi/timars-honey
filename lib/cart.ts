import { PRODUCTS, type Product } from "./products";

// The client cart holds ONLY slug + qty — never prices. The server rebuilds every
// line from the catalogue so a tampered client price is impossible by construction.
export interface CartLine {
  slug: string;
  qty: number;
}

export interface OrderLine {
  slug: string;
  name: string;
  sizeLabel: string;
  unitPriceKobo: number;
  qty: number;
  lineKobo: number;
}

export interface OrderDraft {
  items: OrderLine[];
  subtotalKobo: number;
}

/** Rebuild priced order lines from trusted catalogue data. Skips non-positive
 *  quantities; throws on an unknown slug. */
export function buildOrderDraft(
  lines: CartLine[],
  catalogue: Product[] = PRODUCTS,
): OrderDraft {
  const items: OrderLine[] = [];
  for (const line of lines) {
    if (!Number.isInteger(line.qty) || line.qty <= 0) continue;
    const p = catalogue.find((x) => x.slug === line.slug);
    if (!p) throw new Error(`unknown product: ${line.slug}`);
    items.push({
      slug: p.slug,
      name: p.name,
      sizeLabel: p.sizeLabel,
      unitPriceKobo: p.priceKobo,
      qty: line.qty,
      lineKobo: p.priceKobo * line.qty,
    });
  }
  const subtotalKobo = items.reduce((sum, i) => sum + i.lineKobo, 0);
  return { items, subtotalKobo };
}
