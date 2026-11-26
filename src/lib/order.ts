import { getPrice, getProduct, type Product } from "@/data/catalog";
import type { Lang } from "@/i18n/dictionaries";
import { formatPrice, formatVolume } from "@/lib/format";

export type CartItem = { slug: string; ml: number; qty: number };

export type CartLine = {
  key: string;
  item: CartItem;
  product: Product;
  unitPrice: number;
  lineTotal: number;
};

export function lineKey(slug: string, ml: number) {
  return `${slug}__${ml}`;
}

/** Строки корзины с актуальными ценами из каталога. Недоступные позиции отбрасываются. */
export function resolveCart(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) continue;
    const unitPrice = getPrice(product, item.ml);
    if (unitPrice == null) continue;
    lines.push({
      key: lineKey(item.slug, item.ml),
      item,
      product,
      unitPrice,
      lineTotal: unitPrice * item.qty,
    });
  }
  return lines;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.lineTotal, 0);
}

const GREETING: Record<Lang, string> = {
  ru: "Здравствуйте! Хочу заказать в VELMOR PERFUMES:",
  uz: "Assalomu alaykum! VELMOR PERFUMES do‘konidan buyurtma bermoqchiman:",
};
const TOTAL: Record<Lang, string> = { ru: "Итого", uz: "Jami" };
const LABELS: Record<Lang, { name: string; phone: string; telegram: string; comment: string }> = {
  ru: { name: "Имя", phone: "Телефон", telegram: "Telegram", comment: "Комментарий" },
  uz: { name: "Ism", phone: "Telefon", telegram: "Telegram", comment: "Izoh" },
};

function itemRows(lines: CartLine[], lang: Lang): string[] {
  return lines.map(
    (l, i) =>
      `${i + 1}. ${l.product.brand} ${l.product.name}, ${formatVolume(l.item.ml, lang, true)} × ${l.item.qty} — ${formatPrice(
        l.lineTotal,
        lang,
        true,
      )}`,
  );
}

/** Частично заполненные данные покупателя (для предпросмотра текста, пока форма не заполнена). */
export type CustomerDraft = Partial<Record<"name" | "phone" | "telegram" | "comment", string>>;

function customerRows(c: CustomerDraft | undefined, lang: Lang): string[] {
  if (!c) return [];
  const L = LABELS[lang];
  const rows: string[] = [];
  if (c.name?.trim()) rows.push(`${L.name}: ${c.name.trim()}`);
  if (c.phone?.trim()) rows.push(`${L.phone}: ${c.phone.trim()}`);
  if (c.telegram?.trim()) rows.push(`${L.telegram}: ${c.telegram.trim()}`);
  if (c.comment?.trim()) rows.push(`${L.comment}: ${c.comment.trim()}`);
  return rows;
}

/** Текст заказа, который покупатель копирует или отправляет. Строится из реальной корзины. */
export function buildOrderMessage(lines: CartLine[], lang: Lang, customer?: CustomerDraft): string {
  const who = customerRows(customer, lang);
  return [
    GREETING[lang],
    ...itemRows(lines, lang),
    `${TOTAL[lang]}: ${formatPrice(cartTotal(lines), lang, true)}`,
    ...(who.length ? ["", ...who] : []),
  ].join("\n");
}

/** Сообщение менеджеру от бота (всегда на русском, с пометкой языка сайта покупателя). */
export function buildManagerMessage(lines: CartLine[], customer: CustomerDraft, lang: Lang): string {
  return [
    "🛍 Новый заказ с сайта VELMOR PERFUMES",
    "",
    ...customerRows(customer, "ru"),
    "",
    ...itemRows(lines, "ru"),
    `Итого: ${formatPrice(cartTotal(lines), "ru", true)}`,
    "",
    `Язык сайта: ${lang.toUpperCase()}`,
  ].join("\n");
}
