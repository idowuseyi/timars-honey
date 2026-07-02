"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartLine } from "@/lib/cart";

interface CartContextValue {
  items: CartLine[];
  count: number;
  hydrated: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "th-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((slug: string, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((l) => l.slug === slug);
      if (found) {
        return cur.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
      }
      return [...cur, { slug, qty }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((cur) =>
      qty <= 0
        ? cur.filter((l) => l.slug !== slug)
        : cur.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback(
    (slug: string) => setItems((cur) => cur.filter((l) => l.slug !== slug)),
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((n, l) => n + l.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, hydrated, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
