// Seed the catalogue into Neon: `npm run db:seed` (needs DATABASE_URL).
// Safe to re-run — existing products (and any price edits) are left untouched.
import { withDb } from "./client";
import { seedProducts } from "../lib/repo";

withDb(seedProducts)
  .then(() => console.log("seeded products"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
