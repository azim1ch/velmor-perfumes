"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllBrands, getAllVolumes, publishedProducts } from "@/data/catalog";
import { useLang } from "@/i18n/LangProvider";
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  filtersToSearch,
  parseFilters,
  type CatalogFilters,
  type SortKey,
} from "@/lib/filters";
import { countLabel, formatVolume, groupDigits } from "@/lib/format";
import { CloseIcon, FilterIcon, SearchIcon } from "./Icons";
import { ProductCard } from "./ProductCard";

const BRANDS = getAllBrands();
const VOLUMES = getAllVolumes();

export function CatalogView() {
  const { t, lang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);

  const update = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const next = { ...filters, ...patch };
      router.replace(`${pathname}${filtersToSearch(next)}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const results = useMemo(() => applyFilters(publishedProducts, filters), [filters]);
  const nActive = activeFilterCount(filters);

  // --- поиск с задержкой, синхронизирован с URL ---
  const [q, setQ] = useState(filters.q);
  const lastUrlQ = useRef(filters.q);
  useEffect(() => {
    if (filters.q !== lastUrlQ.current) {
      lastUrlQ.current = filters.q;
      setQ(filters.q);
    }
  }, [filters.q]);
  useEffect(() => {
    if (q.trim() === filters.q.trim()) return;
    const id = setTimeout(() => {
      lastUrlQ.current = q.trim();
      update({ q });
    }, 250);
    return () => clearTimeout(id);
  }, [q, filters.q, update]);

  const resetAll = () => {
    setQ("");
    lastUrlQ.current = "";
    router.replace(`${pathname}${filtersToSearch({ ...EMPTY_FILTERS, sort: filters.sort })}`, { scroll: false });
  };

  // --- нижняя панель фильтров на телефоне ---
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [sheetOpen]);
  // при переходе на десктоп панель закрываем
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const h = () => mq.matches && setSheetOpen(false);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const sortOptions: { v: SortKey; label: string }[] = [
    { v: "default", label: t.catalog.sortDefault },
    { v: "price-asc", label: t.catalog.sortPriceAsc },
    { v: "price-desc", label: t.catalog.sortPriceDesc },
    { v: "name", label: t.catalog.sortName },
  ];

  return (
    <div className="container-x pt-6 sm:pt-10">
      <div className="mb-5 flex items-baseline justify-between gap-4 sm:mb-7">
        <h1 className="font-serif text-4xl font-medium text-cream sm:text-5xl">{t.catalog.title}</h1>
      </div>

      <div className="lg:grid lg:grid-cols-[232px_1fr] lg:gap-10 xl:grid-cols-[248px_1fr]">
        {/* Фильтры слева (десктоп) */}
        <aside aria-label={t.catalog.filters} className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel filters={filters} update={update} />
            {nActive > 0 && (
              <button type="button" onClick={resetAll} className="mt-6 text-[14px] font-medium text-gold underline-offset-4 hover:underline">
                {t.catalog.reset}
              </button>
            )}
          </div>
        </aside>

        <section aria-labelledby="results-count">
          {/* Поиск, сортировка, количество */}
          <div className="flex flex-col gap-3 border-b border-line/70 pb-4 sm:flex-row sm:items-center">
            <label className="relative block flex-1">
              <span className="sr-only">{t.catalog.searchLabel}</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                enterKeyHint="search"
                className="field pl-9"
              />
            </label>
            <div className="flex gap-2">
              <button
                ref={openerRef}
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
                className="btn-outline min-h-[44px] flex-1 px-4 text-[14px] lg:hidden"
              >
                <FilterIcon className="h-4 w-4" />
                {t.catalog.filters}
                {nActive > 0 && (
                  <span className="ml-0.5 rounded-full bg-gold px-1.5 text-[12px] font-semibold text-ink">{nActive}</span>
                )}
              </button>
              <label className="relative flex-1 sm:w-52 sm:flex-none">
                <span className="sr-only">{t.catalog.sort}</span>
                <select
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as SortKey })}
                  className="field h-11 cursor-pointer appearance-none pr-8 text-[14px]"
                >
                  {sortOptions.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                  ▼
                </span>
              </label>
            </div>
          </div>

          <p id="results-count" aria-live="polite" className="py-4 text-[14px] text-muted">
            {lang === "ru" ? "Найдено: " : "Topildi: "}
            <span className="font-semibold text-cream">{countLabel(results.length, lang)}</span>
            {filters.ml != null && (filters.min != null || filters.max != null) && (
              <span className="mt-1 block text-[13px] sm:ml-2 sm:mt-0 sm:inline">
                <span className="hidden sm:inline">{" · "}</span>
                {t.catalog.volumeHint} ({formatVolume(filters.ml, lang)})
              </span>
            )}
          </p>

          {results.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 xl:grid-cols-4">
              {results.map((p, i) => (
                <li key={p.slug} className="flex">
                  <div className="w-full">
                    <ProductCard product={p} selectedMl={filters.ml} priority={i < 4} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-sm bg-surface px-6 py-14 text-center">
              <p className="font-serif text-3xl text-cream">{t.catalog.emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">{t.catalog.emptyText}</p>
              <button type="button" onClick={resetAll} className="btn-gold mt-6">
                {t.catalog.reset}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Нижняя панель фильтров (телефон/планшет) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 h-full w-full cursor-default bg-black/70"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-xl border-t border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
              <h2 id="sheet-title" className="font-serif text-2xl text-cream">
                {t.catalog.filters}
              </h2>
              <button
                ref={sheetCloseRef}
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label={t.catalog.close}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cream hover:text-gold"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-5">
              <FilterPanel filters={filters} update={update} />
            </div>
            <div className="flex gap-3 border-t border-line/70 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
              <button type="button" onClick={resetAll} disabled={nActive === 0} className="btn-outline flex-1 px-3 text-[14px] disabled:opacity-40">
                {t.catalog.reset}
              </button>
              <button type="button" onClick={() => setSheetOpen(false)} className="btn-gold flex-1 px-3 text-[14px]">
                {t.catalog.show} ({results.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ filters, update }: { filters: CatalogFilters; update: (p: Partial<CatalogFilters>) => void }) {
  const { t, lang } = useLang();

  const toggleBrand = (b: string) =>
    update({ brands: filters.brands.includes(b) ? filters.brands.filter((x) => x !== b) : [...filters.brands, b] });

  const chip = (active: boolean) =>
    `h-10 min-w-[60px] rounded-sm border px-3 text-[14px] font-medium transition-colors ${
      active ? "border-gold bg-gold/10 text-gold" : "border-line text-cream hover:border-muted"
    }`;

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="eyebrow mb-3">{t.catalog.volume}</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={filters.ml == null} onClick={() => update({ ml: null })} className={chip(filters.ml == null)}>
            {t.catalog.anyVolume}
          </button>
          {VOLUMES.map((ml) => (
            <button
              key={ml}
              type="button"
              aria-pressed={filters.ml === ml}
              onClick={() => update({ ml: filters.ml === ml ? null : ml })}
              className={chip(filters.ml === ml)}
            >
              {formatVolume(ml, lang)}
            </button>
          ))}
        </div>
      </fieldset>

      <PriceRange filters={filters} update={update} />

      <fieldset>
        <legend className="eyebrow mb-2">{t.catalog.brand}</legend>
        <ul className="space-y-0.5">
          {BRANDS.map((b) => {
            const checked = filters.brands.includes(b);
            return (
              <li key={b}>
                <label className="flex min-h-[40px] cursor-pointer items-center gap-3 text-[15px] text-cream">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(b)}
                    className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[3px] border border-muted/60 bg-transparent bg-center bg-no-repeat checked:border-gold checked:bg-gold"
                    style={
                      checked
                        ? {
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310100F' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 12.5 4.5 4.5L19 7.5'/%3E%3C/svg%3E\")",
                            backgroundSize: "14px",
                          }
                        : undefined
                    }
                  />
                  {b}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

function PriceRange({ filters, update }: { filters: CatalogFilters; update: (p: Partial<CatalogFilters>) => void }) {
  const { t, lang } = useLang();
  const ph = (word: string, n: string) => (lang === "ru" ? `${word} ${n}` : `${n} ${word}`);
  const [min, setMin] = useState(filters.min != null ? String(filters.min) : "");
  const [max, setMax] = useState(filters.max != null ? String(filters.max) : "");

  useEffect(() => setMin(filters.min != null ? String(filters.min) : ""), [filters.min]);
  useEffect(() => setMax(filters.max != null ? String(filters.max) : ""), [filters.max]);

  const parse = (s: string) => {
    const d = s.replace(/[^\d]/g, "");
    return d ? Number(d) : null;
  };

  // применяем с небольшой задержкой, чтобы не дёргать URL на каждую цифру
  useEffect(() => {
    const nMin = parse(min);
    const nMax = parse(max);
    if (nMin === filters.min && nMax === filters.max) return;
    const id = setTimeout(() => update({ min: nMin, max: nMax }), 500);
    return () => clearTimeout(id);
  }, [min, max, filters.min, filters.max, update]);

  const show = (s: string) => {
    const n = parse(s);
    return n == null ? "" : groupDigits(n, " ");
  };

  return (
    <fieldset>
      <legend className="eyebrow mb-3">{t.catalog.price}</legend>
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">{ph(t.catalog.priceFrom, t.catalog.price)}</span>
          <input
            inputMode="numeric"
            value={show(min)}
            onChange={(e) => setMin(e.target.value)}
            placeholder={ph(t.catalog.priceFrom, "70 000")}
            className="field text-[14px]"
          />
        </label>
        <span aria-hidden className="text-muted">
          –
        </span>
        <label className="flex-1">
          <span className="sr-only">{ph(t.catalog.priceTo, t.catalog.price)}</span>
          <input
            inputMode="numeric"
            value={show(max)}
            onChange={(e) => setMax(e.target.value)}
            placeholder={ph(t.catalog.priceTo, "350 000")}
            className="field text-[14px]"
          />
        </label>
      </div>
    </fieldset>
  );
}
