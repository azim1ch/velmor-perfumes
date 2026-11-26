"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/order";

const CART_KEY = "velmor:cart:v1";
const FAV_KEY = "velmor:favorites:v1";

type ShopCtx = {
  /** false до чтения localStorage — чтобы не мигали счётчики при гидратации */
  ready: boolean;
  cart: CartItem[];
  favorites: string[];
  addToCart: (slug: string, ml: number, qty?: number) => void;
  setQty: (slug: string, ml: number, qty: number) => void;
  removeFromCart: (slug: string, ml: number) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  cartCount: number;
};

const Ctx = createContext<ShopCtx | null>(null);

function readJSON<T>(key: string, fallback: T, guard: (v: unknown) => v is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const v: unknown = JSON.parse(raw);
    return guard(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, v: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* приватный режим / переполнение — корзина просто не сохранится */
  }
}

const isCart = (v: unknown): v is CartItem[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      typeof x === "object" &&
      typeof (x as CartItem).slug === "string" &&
      typeof (x as CartItem).ml === "number" &&
      typeof (x as CartItem).qty === "number",
  );
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

export function ShopProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setCart(readJSON(CART_KEY, [], isCart));
    setFavorites(readJSON(FAV_KEY, [], isStrArr));
    setReady(true);

    // синхронизация между вкладками
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCart(readJSON(CART_KEY, [], isCart));
      if (e.key === FAV_KEY) setFavorites(readJSON(FAV_KEY, [], isStrArr));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) writeJSON(CART_KEY, cart);
  }, [cart, ready]);
  useEffect(() => {
    if (ready) writeJSON(FAV_KEY, favorites);
  }, [favorites, ready]);

  const addToCart = useCallback((slug: string, ml: number, qty = 1) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.slug === slug && x.ml === ml);
      if (i === -1) return [...prev, { slug, ml, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, ml: number, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((x) => !(x.slug === slug && x.ml === ml))
        : prev.map((x) => (x.slug === slug && x.ml === ml ? { ...x, qty: Math.min(99, qty) } : x)),
    );
  }, []);

  const removeFromCart = useCallback((slug: string, ml: number) => {
    setCart((prev) => prev.filter((x) => !(x.slug === slug && x.ml === ml)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const value = useMemo<ShopCtx>(
    () => ({
      ready,
      cart,
      favorites,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleFavorite,
      isFavorite: (slug) => favorites.includes(slug),
      cartCount: cart.reduce((s, x) => s + x.qty, 0),
    }),
    [ready, cart, favorites, addToCart, setQty, removeFromCart, clearCart, toggleFavorite],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop(): ShopCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}
