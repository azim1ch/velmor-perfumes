"use client";

import Link from "next/link";
import { getMinPrice, getPrice, type Product } from "@/data/catalog";
import { useLang } from "@/i18n/LangProvider";
import { formatPrice, formatPriceFrom, formatVolume } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";
import { ProductImage } from "./ProductImage";

type Props = {
  product: Product;
  /** Если в фильтре выбран объём — показываем цену именно его */
  selectedMl?: number | null;
  priority?: boolean;
};

export function ProductCard({ product, selectedMl = null, priority }: Props) {
  const { lang, t } = useLang();
  const minPrice = getMinPrice(product);
  const volPrice = selectedMl != null ? getPrice(product, selectedMl) : null;

  let priceText: string;
  if (volPrice != null && selectedMl != null) {
    priceText = `${formatVolume(selectedMl, lang)} — ${formatPrice(volPrice, lang)}`;
  } else if (minPrice != null) {
    priceText = formatPriceFrom(minPrice, lang);
  } else {
    priceText = t.product.askPrice;
  }

  const href = `/product/${product.slug}${selectedMl != null && volPrice != null ? `?ml=${selectedMl}` : ""}`;

  return (
    <article className="group relative flex flex-col">
      <Link href={href} className="flex flex-1 flex-col rounded-sm focus-visible:outline-offset-4">
        <ProductImage
          product={product}
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 24vw, (min-width: 640px) 33vw, 50vw"
          className="rounded-sm transition-opacity duration-300 group-hover:opacity-90"
        />
        <div className="flex flex-1 flex-col pt-3">
          <p className="eyebrow">{product.brand}</p>
          <h3 className="mt-1 font-serif text-[19px] font-medium leading-[1.15] text-cream sm:text-[22px]">
            {product.name}
          </h3>
          <p
            className={`mt-auto pt-2 text-[14px] font-semibold sm:text-[15px] ${
              minPrice == null ? "text-gold" : "text-cream"
            }`}
          >
            {priceText}
          </p>
        </div>
      </Link>
      <FavoriteButton slug={product.slug} className="absolute right-2 top-2" />
    </article>
  );
}
