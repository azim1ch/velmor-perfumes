import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { getDict } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).cart.title };
}

export default function CartPage() {
  // Бот настроен, если в .env.local заданы токен и чат менеджера
  const botEnabled = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim());
  return <CartView botEnabled={botEnabled} />;
}
