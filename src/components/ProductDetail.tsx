"use client";

import Link from "next/link";
import { useState } from "react";
import { getManagerUrl, storeConfig } from "@/config/store";
import { getProduct, getVolumes } from "@/data/catalog";
import { useLang } from "@/i18n/LangProvider";
import { formatPrice, formatVolume } from "@/lib/format";
import { useShop } from "@/store/ShopProvider";
import { FavoriteButton } from "./FavoriteButton";
import { FragranceDetails } from "./FragranceDetails";
import { ArrowIcon, BackIcon, CheckIcon, TelegramIcon } from "./Icons";
import { ProductImage } from "./ProductImage";

export function ProductDetail({ slug, initialMl }: { slug: string; initialMl: number | null }) {
  const { t, lang } = useLang();
  const { addToCart } = useShop();
  const product = getProduct(slug)!;
  const volumes = getVolumes(product);
  const hasPrice = volumes.length > 0;

  const [ml, setMl] = useState<number | null>(() =>
    initialMl != null && volumes.some((v) => v.ml === initialMl) ? initialMl : (volumes[0]?.ml ?? null),
  );
  const [added, setAdded] = useState<number | null>(null); // объём, добавленный последним

  const selected = volumes.find((v) => v.ml === ml) ?? null;
  const askUrl = getManagerUrl() ?? storeConfig.telegramChannelUrl;

  return (
    <div className="container-x pt-4 sm:pt-8">
      <Link href="/catalog" className="inline-flex items-center gap-2 py-2 text-[14px] text-muted transition-colors hover:text-gold">
        <BackIcon />
        {t.product.back}
      </Link>

      <div className="mt-3 grid gap-7 md:grid-cols-[1.05fr_1fr] md:gap-10 lg:gap-16">
        <div className="relative -mx-4 sm:mx-0">
          <ProductImage
            product={product}
            priority
            variant="hero"
            sizes="(min-width: 1360px) 660px, (min-width: 768px) 50vw, 100vw"
            className="sm:rounded-sm"
          />
          {product.photo?.credit && (
            <p className="mt-2 px-4 text-[12px] text-muted sm:px-0">
              {t.product.photoCredit}: {product.photo.credit}
            </p>
          )}
        </div>

        <div className="md:pt-4">
          <p className="eyebrow text-[12px]">{product.brand}</p>
          <h1 className="mt-2 font-serif text-[38px] font-medium leading-[1.05] text-cream sm:text-5xl lg:text-[56px]">
            {product.name}
          </h1>

          {hasPrice ? (
            <>
              <p className="mt-6 text-[28px] font-semibold text-cream sm:text-[32px]" aria-live="polite" aria-atomic="true">
                {selected && formatPrice(selected.price, lang)}
              </p>

              <fieldset className="mt-7">
                <legend className="eyebrow mb-3">{t.product.volume}</legend>
                <div role="radiogroup" aria-label={t.product.volume} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {volumes.map((v) => {
                    const on = v.ml === ml;
                    return (
                      <button
                        key={v.ml}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          setMl(v.ml);
                          setAdded(null);
                        }}
                        className={`flex min-h-[60px] flex-col items-center justify-center rounded-sm border px-1 py-2 transition-colors ${
                          on ? "border-gold bg-gold/10" : "border-line hover:border-muted"
                        }`}
                      >
                        <span className={`text-[15px] font-semibold ${on ? "text-gold" : "text-cream"}`}>{formatVolume(v.ml, lang)}</span>
                        <span className="mt-0.5 text-[12px] text-muted">{formatPrice(v.price, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  className="btn-gold flex-1"
                  disabled={!selected}
                  onClick={() => {
                    if (!selected) return;
                    addToCart(product.slug, selected.ml);
                    setAdded(selected.ml);
                  }}
                >
                  {t.product.addToCart}
                  {selected && <span className="font-normal opacity-80">· {formatVolume(selected.ml, lang)}</span>}
                </button>
                <FavoriteButton slug={product.slug} large />
              </div>

              <div aria-live="polite" className="min-h-[28px]">
                {added != null && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-cream">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckIcon className="h-4 w-4 text-gold" />
                      {t.product.added} ({formatVolume(added, lang)})
                    </span>
                    <Link href="/cart" className="inline-flex items-center gap-1 font-medium text-gold hover:text-gold-soft">
                      {t.product.goToCart}
                      <ArrowIcon />
                    </Link>
                  </p>
                )}
              </div>

              <p className="mt-6 border-t border-line/70 pt-5 text-[14px] leading-relaxed text-muted">{t.product.orderNote}</p>
            </>
          ) : (
            <>
              <p className="mt-6 text-[17px] font-semibold text-gold">{t.product.askPrice}</p>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{t.product.askPriceText}</p>
              <div className="mt-7 flex gap-3">
                <a href={askUrl} target="_blank" rel="noopener noreferrer" className="btn-gold flex-1">
                  <TelegramIcon className="h-5 w-5" />
                  {t.product.askPrice}
                </a>
                <FavoriteButton slug={product.slug} large />
              </div>
            </>
          )}
        </div>
      </div>

      <FragranceDetails slug={product.slug} />
    </div>
  );
}
