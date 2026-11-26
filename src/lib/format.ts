import type { Lang } from "@/i18n/dictionaries";

const NBSP = " ";

/** 150000 → "150 000" (разделитель — обычный или неразрывный пробел) */
export function groupDigits(n: number, sep: string = NBSP): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

const CURRENCY: Record<Lang, string> = { ru: "сум", uz: "so‘m" };

/** "150 000 сум" / "150 000 so‘m". plain=true — обычные пробелы (для текста заказа). */
export function formatPrice(n: number, lang: Lang, plain = false): string {
  const sp = plain ? " " : NBSP;
  return `${groupDigits(n, sp)}${sp}${CURRENCY[lang]}`;
}

/** "от 70 000 сум" / "70 000 so‘mdan" */
export function formatPriceFrom(n: number, lang: Lang): string {
  return lang === "ru" ? `от${NBSP}${formatPrice(n, lang)}` : `${formatPrice(n, lang)}dan`;
}

export function formatVolume(ml: number, lang: Lang, plain = false): string {
  return `${ml}${plain ? " " : NBSP}${lang === "ru" ? "мл" : "ml"}`;
}

/** Русские формы: 1 аромат, 2 аромата, 5 ароматов */
export function countLabel(n: number, lang: Lang): string {
  if (lang === "uz") return `${n} ta atir`;
  const m10 = n % 10;
  const m100 = n % 100;
  let w = "ароматов";
  if (m10 === 1 && m100 !== 11) w = "аромат";
  else if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) w = "аромата";
  return `${n} ${w}`;
}
