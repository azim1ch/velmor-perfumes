"use client";

import Link from "next/link";
import { getProduct, type Product } from "@/data/catalog";
import { useLang } from "@/i18n/LangProvider";
import { useShop } from "@/store/ShopProvider";
import { ArrowIcon } from "./Icons";
import { ProductCard } from "./ProductCard";

export function FavoritesView() {
  const { t } = useLang();
  const { ready, favorites } = useShop();
  const items = favorites.map(getProduct).filter((p): p is Product => Boolean(p));

  return (
    <div className="container-x pt-6 sm:pt-10">
      <h1 className="mb-6 font-serif text-4xl font-medium text-cream sm:text-5xl">{t.favorites.title}</h1>
      {!ready ? (
        <div className="h-40" aria-busy="true" />
      ) : items.length === 0 ? (
        <div className="rounded-sm bg-surface px-6 py-14 text-center">
          <p className="text-[16px] text-muted">{t.favorites.empty}</p>
          <Link href="/catalog" className="btn-gold mt-6">
            {t.home.cta}
            <ArrowIcon />
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
