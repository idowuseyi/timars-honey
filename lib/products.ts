// Seed catalogue. In production these rows live in Postgres so prices can change
// without a redeploy (see db/schema.ts); this static list seeds the DB and drives
// the storefront until the admin CRUD milestone lands. Prices are integer kobo.

export interface Product {
  slug: string;
  name: string;
  sizeLabel: string;
  sizeMl: number;
  priceKobo: number;
  description: string;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "big-50cl",
    name: "Big",
    sizeLabel: "50 cl",
    sizeMl: 500,
    priceKobo: 600_000, // ₦6,000
    description:
      "Our 50 cl bottle of pure, farm-sourced honey — the easy everyday size for tea, toast, and cooking.",
    image: "/products/big-50cl.jpg",
  },
  {
    slug: "biggy-1l",
    name: "Biggy",
    sizeLabel: "1 litre",
    sizeMl: 1000,
    priceKobo: 1_200_000, // ₦12,000
    description:
      "A full litre of pure honey for the household that gets through it — sweetening, drinks, and gifting.",
    image: "/products/biggy-1l.jpg",
  },
  {
    slug: "keg-a-5l",
    name: "Keg A",
    sizeLabel: "5 litres",
    sizeMl: 5000,
    priceKobo: 5_500_000, // ₦55,000
    description:
      "The 5-litre keg — better value per litre for large families, caterers, and resellers.",
    image: "/products/keg-a-5l.jpg",
  },
  {
    slug: "keg-c-10l",
    name: "Keg C",
    sizeLabel: "10 litres",
    sizeMl: 10000,
    priceKobo: 9_900_000, // ₦99,000
    description:
      "The 10-litre keg for bulk buyers — the same pure honey at a keener per-litre price.",
    image: "/products/keg-c-10l.jpg",
  },
  {
    slug: "keg-b-25l",
    name: "Keg B",
    sizeLabel: "25 litres",
    sizeMl: 25000,
    priceKobo: 21_800_000, // ₦218,000
    description:
      "Our largest keg, 25 litres — wholesale volume for distributors and trade partners.",
    image: "/products/keg-b-25l.jpg",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
