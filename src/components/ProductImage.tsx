"use client";

import Image from "next/image";
import type { Product } from "@/data/catalog";
import { useLang } from "@/i18n/LangProvider";

type Props = {
  product: Product;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** размер текста обложки: карточка или страница товара */
  variant?: "card" | "hero" | "thumb";
};

/**
 * Фото товара в рамке 4:5. Если фото нет — аккуратная типографическая обложка
 * с брендом и названием (никаких подставных флаконов).
 */
export function ProductImage({ product, sizes, priority, className = "", variant = "card" }: Props) {
  const { lang } = useLang();
  const photo = product.photo;

  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden bg-surface ${className}`}>
      {photo && photo.fit === "contain" ? (
        // Вырезанный флакон на прозрачном фоне: тёплый боковой свет и мягкая тень, как в студии
        <div className="absolute inset-0" style={{ background: STUDIO_BG }}>
          <span
            aria-hidden
            className="absolute bottom-[7%] left-1/2 h-[5%] w-[58%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-md"
          />
          <div className={`absolute ${variant === "thumb" ? "inset-[6%]" : "inset-x-[12%] bottom-[9%] top-[8%]"}`}>
            <Image
              src={photo.src}
              alt={photo.alt[lang]}
              fill
              sizes={sizes}
              priority={priority}
              quality={85}
              className="object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      ) : photo ? (
        <Image
          src={photo.src}
          alt={photo.alt[lang]}
          fill
          sizes={sizes}
          priority={priority}
          quality={80}
          className="object-cover"
          style={{ objectPosition: photo.position ?? "50% 50%" }}
        />
      ) : (
        <TypeCover product={product} variant={variant} />
      )}
    </div>
  );
}

const STUDIO_BG =
  "radial-gradient(70% 55% at 50% 42%, rgba(244,238,228,0.16) 0%, rgba(197,161,107,0.08) 45%, transparent 75%), radial-gradient(90% 70% at 15% 15%, rgba(197,161,107,0.14) 0%, transparent 60%), linear-gradient(170deg, #2a2724 0%, #1b1a18 55%, #131211 100%)";

function TypeCover({ product, variant }: { product: Product; variant: "card" | "hero" | "thumb" }) {
  const nameSize =
    variant === "hero"
      ? "text-4xl sm:text-5xl"
      : variant === "thumb"
        ? "text-[13px] leading-tight"
        : "text-[19px] sm:text-2xl";
  return (
    <div
      role="img"
      aria-label={`${product.brand} — ${product.name}`}
      className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center"
      style={{
        // тёплый боковой свет, как на фирменных снимках
        background:
          "radial-gradient(120% 80% at 18% 22%, rgba(197,161,107,0.16) 0%, rgba(197,161,107,0.04) 38%, transparent 62%), linear-gradient(160deg, #22201d 0%, #171614 55%, #121110 100%)",
      }}
    >
      {variant !== "thumb" && (
        <span className="mb-3 text-[10px] font-medium uppercase tracking-[0.32em] text-gold/80 sm:text-[11px]">
          VELMOR
        </span>
      )}
      <span
        className={`font-sans font-medium uppercase text-muted ${
          variant === "thumb" ? "text-[8px] tracking-[0.14em]" : "text-[10px] tracking-[0.2em] sm:text-xs"
        }`}
      >
        {product.brand}
      </span>
      <span aria-hidden className={`my-2 block h-px bg-gold/50 ${variant === "thumb" ? "w-4" : "w-8"}`} />
      <span className={`font-serif font-medium text-cream ${nameSize}`}>{product.name}</span>
    </div>
  );
}
