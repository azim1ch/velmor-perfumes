/** Данные покупателя для заказа и их проверка (используется и в браузере, и на сервере). */

export type Customer = {
  name: string;
  phone: string;
  telegram?: string;
  comment?: string;
};

export type CustomerErrors = Partial<Record<keyof Customer, true>>;

export const LIMITS = { name: 60, comment: 500, telegram: 33 } as const;

/**
 * Номер Узбекистана → "+998 90 123 45 67".
 * Принимает "901234567", "998901234567", "+998 (90) 123-45-67".
 * Номер другой страны принимается, если начинается с "+" и содержит 10–15 цифр.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let d = digits;
  if (d.length === 9) d = `998${d}`;
  if (d.length === 12 && d.startsWith("998")) {
    return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  if (raw.trim().startsWith("+") && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

/** "@user_name" или null, если поле пустое. undefined — неверный формат. */
export function normalizeTelegram(raw: string): string | null | undefined {
  const v = raw.trim().replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");
  if (!v) return null;
  return /^[A-Za-z0-9_]{4,32}$/.test(v) ? `@${v}` : undefined;
}

/** Проверяет и нормализует данные. Возвращает либо ошибки, либо готового покупателя. */
export function validateCustomer(input: {
  name?: unknown;
  phone?: unknown;
  telegram?: unknown;
  comment?: unknown;
}): { ok: true; customer: Customer } | { ok: false; errors: CustomerErrors } {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const name = str(input.name).trim().replace(/\s+/g, " ");
  const phone = normalizePhone(str(input.phone));
  const telegram = normalizeTelegram(str(input.telegram));
  const comment = str(input.comment).trim();

  const errors: CustomerErrors = {};
  if (name.length < 2 || name.length > LIMITS.name) errors.name = true;
  if (!phone) errors.phone = true;
  if (telegram === undefined) errors.telegram = true;
  if (comment.length > LIMITS.comment) errors.comment = true;
  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    customer: { name, phone: phone!, telegram: telegram ?? undefined, comment: comment || undefined },
  };
}
