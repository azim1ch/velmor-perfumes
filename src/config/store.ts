/**
 * Контакты и настройки магазина.
 * Здесь владелец меняет ссылки — больше нигде в коде они не повторяются.
 *
 * Автоматическая отправка заказов в Telegram настраивается отдельно, в файле .env.local
 * (TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID). Инструкция — в README.md.
 */
export const storeConfig = {
  name: "VELMOR PERFUMES",

  /** Публичный Telegram-канал магазина. */
  telegramChannelUrl: "https://t.me/VELMORPERFUMES",
  telegramChannelHandle: "@VELMORPERFUMES",

  /**
   * Telegram менеджера, который принимает заказы (username без @).
   * Если строка пустая, кнопка «Написать менеджеру» в корзине не показывается.
   */
  managerTelegram: "Patrick_1208",
} as const;

/** @username менеджера или null */
export function getManagerHandle(): string | null {
  const raw = storeConfig.managerTelegram.trim().replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");
  return raw ? `@${raw}` : null;
}

/** Ссылка на чат с менеджером (с готовым текстом, если передан) или null. */
export function getManagerUrl(text?: string): string | null {
  const handle = getManagerHandle();
  if (!handle) return null;
  const base = `https://t.me/${handle.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
