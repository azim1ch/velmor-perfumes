"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLang } from "@/i18n/LangProvider";
import { useShop } from "@/store/ShopProvider";
import { BagIcon, CloseIcon, HeartIcon, SearchIcon } from "./Icons";

export function Logo() {
  const { t } = useLang();
  return (
    <Link href="/" aria-label={t.nav.home} className="flex flex-col items-start leading-none">
      <span className="font-serif text-[22px] font-medium tracking-logo text-cream sm:text-[26px]">VELMOR</span>
      <span className="mt-1 pl-[2px] text-[8.5px] font-medium tracking-[0.5em] text-gold sm:text-[9.5px]">PERFUMES</span>
    </Link>
  );
}

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute right-0 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold leading-none text-ink">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function Header() {
  const { t } = useLang();
  const { ready, cartCount, favorites } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSearch, setMobileSearch] = useState(false);
  const [q, setQ] = useState("");
  const mobileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearch) mobileInput.current?.focus();
  }, [mobileSearch]);
  useEffect(() => setMobileSearch(false), [pathname]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/catalog?q=${encodeURIComponent(v)}` : "/catalog");
    setQ("");
    setMobileSearch(false);
  };

  const iconBtn =
    "relative inline-flex h-11 w-10 items-center justify-center rounded-full text-cream transition-colors hover:text-gold sm:w-11";
  const onCatalog = pathname?.startsWith("/catalog");

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center gap-2 sm:h-[72px] sm:gap-6">
        <Logo />

        <nav aria-label="Main" className="ml-1 sm:ml-6">
          <Link
            href="/catalog"
            aria-current={onCatalog ? "page" : undefined}
            className={`py-2 text-[14px] font-medium transition-colors hover:text-gold sm:text-[15px] ${
              onCatalog ? "text-gold" : "text-cream"
            }`}
          >
            {t.nav.catalog}
          </Link>
        </nav>

        <form role="search" onSubmit={submit} className="ml-auto hidden max-w-xs flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">{t.nav.search}</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="field h-10 pl-9"
            />
          </label>
        </form>

        <div className="-mr-2 ml-auto flex items-center md:ml-0 md:mr-0">
          <button
            type="button"
            className={`${iconBtn} md:hidden`}
            aria-label={mobileSearch ? t.nav.closeSearch : t.nav.openSearch}
            aria-expanded={mobileSearch}
            aria-controls="mobile-search"
            onClick={() => setMobileSearch((v) => !v)}
          >
            {mobileSearch ? <CloseIcon /> : <SearchIcon />}
          </button>
          <Link href="/favorites" className={iconBtn} aria-label={`${t.nav.favorites}${ready && favorites.length ? ` (${favorites.length})` : ""}`}>
            <HeartIcon />
            {ready && <Badge n={favorites.length} />}
          </Link>
          <Link href="/cart" className={iconBtn} aria-label={`${t.nav.cart}${ready && cartCount ? ` (${cartCount})` : ""}`}>
            <BagIcon />
            {ready && <Badge n={cartCount} />}
          </Link>
        </div>
      </div>

      {mobileSearch && (
        <form id="mobile-search" role="search" onSubmit={submit} className="container-x pb-3 md:hidden">
          <label className="relative block">
            <span className="sr-only">{t.nav.search}</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={mobileInput}
              type="search"
              enterKeyHint="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="field pl-9"
            />
          </label>
        </form>
      )}
    </header>
  );
}
