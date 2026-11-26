import { getMinPrice, getPrice, getVolumes, type Product } from "@/data/catalog";

export type SortKey = "default" | "price-asc" | "price-desc" | "name";
const SORT_KEYS: SortKey[] = ["default", "price-asc", "price-desc", "name"];

export type CatalogFilters = {
  q: string;
  brands: string[];
  ml: number | null;
  min: number | null;
  max: number | null;
  sort: SortKey;
};

export const EMPTY_FILTERS: CatalogFilters = {
  q: "",
  brands: [],
  ml: null,
  min: null,
  max: null,
  sort: "default",
};

/** Нормализация для поиска: регистр, диакритика (é → e, á → a), апострофы, лишние символы. */
export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[’'‘`ʻʼ]/g, "")
    .replace(/[^a-z0-9а-я]+/g, " ")
    .trim();
}

function haystack(p: Product): string {
  return normalizeText([p.brand, p.name, `${p.brand} ${p.name}`, ...(p.aliases ?? [])].join(" | "));
}

export function matchesQuery(p: Product, q: string): boolean {
  const tokens = normalizeText(q).split(" ").filter(Boolean);
  if (!tokens.length) return true;
  const h = haystack(p);
  const compact = h.replace(/ /g, "");
  return tokens.every((t) => h.includes(t) || compact.includes(t));
}

function toNum(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && v.replace(/[^\d]/g, "") !== "" ? n : null;
}

export function parseFilters(sp: URLSearchParams): CatalogFilters {
  const sort = sp.get("sort") as SortKey | null;
  return {
    q: sp.get("q") ?? "",
    brands: (sp.get("brand") ?? "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean),
    ml: toNum(sp.get("ml")),
    min: toNum(sp.get("min")),
    max: toNum(sp.get("max")),
    sort: sort && SORT_KEYS.includes(sort) ? sort : "default",
  };
}

export function filtersToSearch(f: CatalogFilters): string {
  const sp = new URLSearchParams();
  if (f.q.trim()) sp.set("q", f.q.trim());
  if (f.brands.length) sp.set("brand", f.brands.join(","));
  if (f.ml != null) sp.set("ml", String(f.ml));
  if (f.min != null) sp.set("min", String(f.min));
  if (f.max != null) sp.set("max", String(f.max));
  if (f.sort !== "default") sp.set("sort", f.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: CatalogFilters): number {
  return f.brands.length + (f.ml != null ? 1 : 0) + (f.min != null || f.max != null ? 1 : 0);
}

/** Цена, по которой фильтруем и сортируем: выбранный объём или минимальная. */
export function relevantPrice(p: Product, ml: number | null): number | null {
  return ml != null ? getPrice(p, ml) : getMinPrice(p);
}

export function applyFilters(list: Product[], f: CatalogFilters): Product[] {
  const hasPriceFilter = f.min != null || f.max != null;
  const inRange = (price: number) => (f.min == null || price >= f.min) && (f.max == null || price <= f.max);

  const out = list.filter((p) => {
    if (!matchesQuery(p, f.q)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;

    if (f.ml != null) {
      const price = getPrice(p, f.ml);
      if (price == null) return false; // у аромата нет такого объёма
      if (hasPriceFilter && !inRange(price)) return false; // проверяем цену ИМЕННО этого объёма
    } else if (hasPriceFilter) {
      if (!getVolumes(p).some((v) => inRange(v.price))) return false;
    }
    return true;
  });

  const sorted = [...out];
  if (f.sort === "default") {
    // «По умолчанию»: сначала позиции с собственными фото магазина, дальше — порядок из файла данных
    const own = (p: (typeof sorted)[number]) => Number(Boolean(p.photo && !p.photo.credit));
    return sorted.sort((a, b) => own(b) - own(a));
  }
  if (f.sort === "name") {
    sorted.sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`));
  } else {
    const dir = f.sort === "price-asc" ? 1 : -1;
    sorted.sort((a, b) => {
      const pa = relevantPrice(a, f.ml);
      const pb = relevantPrice(b, f.ml);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1; // без цены — всегда в конце
      if (pb == null) return -1;
      return (pa - pb) * dir;
    });
  }
  return sorted;
}
