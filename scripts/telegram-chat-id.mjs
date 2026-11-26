// Показывает id чатов, которые писали вашему боту, чтобы заполнить TELEGRAM_CHAT_ID.
// Порядок: менеджер открывает бота в Telegram и нажимает «Start», затем: npm run telegram:chat-id
import { readFileSync } from "node:fs";

function readEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, "utf8")
        .split(/\r?\n/)
        .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
        }),
    );
  } catch {
    return {};
  }
}

const env = { ...readEnvFile(".env.local"), ...process.env };
const token = env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Не найден TELEGRAM_BOT_TOKEN. Добавьте его в файл .env.local (см. .env.example).");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await res.json();
if (!data.ok) {
  console.error("Telegram ответил ошибкой:", data.description);
  process.exit(1);
}

const chats = new Map();
for (const u of data.result) {
  const chat = (u.message ?? u.edited_message ?? u.my_chat_member)?.chat;
  if (chat) chats.set(chat.id, chat);
}

if (!chats.size) {
  console.log("Сообщений пока нет. Попросите менеджера открыть бота и нажать «Start», затем запустите команду снова.");
} else {
  console.log("Чаты, которые писали боту:");
  for (const c of chats.values()) {
    const who = c.username ? `@${c.username}` : [c.first_name, c.last_name].filter(Boolean).join(" ") || c.title;
    console.log(`  ${who}  →  TELEGRAM_CHAT_ID=${c.id}`);
  }
}
