import { NextResponse } from "next/server";
import { validateCustomer } from "@/lib/customer";
import { buildManagerMessage, resolveCart, type CartItem } from "@/lib/order";

/**
 * POST /api/order — отправляет заказ менеджеру в Telegram через бота.
 *
 * Нужны переменные окружения (файл .env.local):
 *   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID   — id чата менеджера (узнать: npm run telegram:chat-id)
 * Цены пересчитываются на сервере по каталогу: присланным из браузера суммам не доверяем.
 */

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return fail("not_configured", 503);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail("bad_request", 400);
  }

  // Ловушка для ботов: скрытое поле, которое человек не заполняет
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  if (rateLimited(ip)) return fail("rate_limited", 429);

  const check = validateCustomer((body.customer ?? {}) as Record<string, unknown>);
  if (!check.ok) return fail("invalid_customer", 400);

  const lang = body.lang === "uz" ? "uz" : "ru";
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const items: CartItem[] = rawItems
    .filter(
      (x): x is CartItem =>
        !!x &&
        typeof x === "object" &&
        typeof (x as CartItem).slug === "string" &&
        Number.isInteger((x as CartItem).ml) &&
        Number.isInteger((x as CartItem).qty) &&
        (x as CartItem).qty >= 1 &&
        (x as CartItem).qty <= 99,
    )
    .map((x) => ({ slug: x.slug, ml: x.ml, qty: x.qty }));

  const lines = resolveCart(items);
  if (!lines.length || lines.length !== rawItems.length) return fail("invalid_cart", 400);

  const text = buildManagerMessage(lines, check.customer, lang);
  // TELEGRAM_API_BASE нужен только для локальной проверки с тестовым сервером
  const apiBase = process.env.TELEGRAM_API_BASE?.trim() || "https://api.telegram.org";

  try {
    const res = await fetch(`${apiBase}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!res.ok || !data?.ok) {
      console.error("[order] Telegram error:", res.status, data?.description);
      return fail("send_failed", 502);
    }
  } catch (e) {
    console.error("[order] Telegram request failed:", e);
    return fail("send_failed", 502);
  }

  return NextResponse.json({ ok: true });
}
