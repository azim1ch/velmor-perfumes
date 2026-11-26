"use client";

import Image from "next/image";
import Link from "next/link";
import { featuredSlugs, getProduct, type Product } from "@/data/catalog";
import { useLang } from "@/i18n/LangProvider";
import { ArrowIcon } from "./Icons";
import { ProductCard } from "./ProductCard";

const featured = featuredSlugs.map(getProduct).filter((p): p is Product => Boolean(p));

export function HomeView() {
  const { t } = useLang();

  return (
    <>
      {/* Первый экран: текст слева, фото справа; на телефоне текст над фото */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-6 pb-8 pt-6 md:grid-cols-[1fr_1.05fr] md:gap-10 md:py-12 lg:gap-16 lg:py-16">
          <div className="max-w-xl">
            <h1 className="font-serif font-medium leading-[0.95] text-cream">
              <span className="block text-[44px] tracking-[0.2em] sm:text-6xl lg:text-[84px]">VELMOR</span>
              <span className="mt-2 block text-[13px] font-sans font-medium tracking-[0.55em] text-gold sm:text-base">
                PERFUMES
              </span>
            </h1>
            <p className="mt-5 font-serif text-[24px] italic leading-tight text-cream/90 sm:text-3xl lg:mt-8 lg:text-[38px]">
              Fragrance Beyond Time
            </p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted sm:text-base lg:mt-5">{t.home.lead}</p>
            <Link href="/catalog" className="btn-gold mt-6 w-full sm:w-auto lg:mt-9">
              {t.home.cta}
              <ArrowIcon />
            </Link>
          </div>

          <div className="relative -mx-4 sm:mx-0">
            <div className="relative aspect-[5/4] w-full overflow-hidden sm:rounded-sm md:aspect-[4/5] md:max-h-[calc(100vh-150px)] md:min-h-[480px]">
              <Image
                src="/images/hero-velmor-set.webp"
                alt={t.home.heroAlt}
                fill
                priority
                quality={82}
                sizes="(min-width: 1360px) 640px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
                // этикетка VELMOR и пять атомайзеров остаются в кадре при любом кадрировании
                style={{ objectPosition: "50% 52%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Сразу после первого экрана — ароматы с ценами */}
      <section aria-labelledby="featured-title" className="container-x pt-4 md:pt-6">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-line/70 pb-4">
          <h2 id="featured-title" className="font-serif text-3xl font-medium text-cream sm:text-4xl">
            {t.home.featured}
          </h2>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 py-2 text-[14px] font-medium text-gold transition-colors hover:text-gold-soft sm:text-[15px]"
          >
            {t.home.allCatalog}
            <ArrowIcon />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
