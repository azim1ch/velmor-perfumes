"use client";

import { useLang } from "@/i18n/LangProvider";
import { useShop } from "@/store/ShopProvider";
import { HeartIcon } from "./Icons";

export function FavoriteButton({ slug, className = "", large = false }: { slug: string; className?: string; large?: boolean }) {
  const { t } = useLang();
  const { isFavorite, toggleFavorite } = useShop();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? t.product.removeFav : t.product.addFav}
      title={active ? t.product.removeFav : t.product.addFav}
      className={`inline-flex items-center justify-center rounded-full bg-ink/70 text-cream backdrop-blur-sm transition-colors hover:bg-ink hover:text-gold ${
        large ? "h-12 w-12 border border-line" : "h-10 w-10"
      } ${active ? "text-gold" : ""} ${className}`}
    >
      <HeartIcon filled={active} className={large ? "h-6 w-6" : "h-5 w-5"} />
    </button>
  );
}
