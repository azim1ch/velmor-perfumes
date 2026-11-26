# Как выложить сайт и подключить его к Telegram-боту

Команды выполняются в PowerShell, в папке проекта `C:\Users\Lenovo\Desktop\Velora`.

## 1. Бот (5 минут)
1. В Telegram откройте **@BotFather** → `/newbot` → придумайте имя и username (должен заканчиваться на `bot`).
2. BotFather пришлёт **токен**. Вставьте его в файл `.env.local` после `TELEGRAM_BOT_TOKEN=`.
   Никому не отправляйте токен.
3. **@Patrick_1208** находит бота и нажимает **Start**.
4. Узнайте id его чата:
   ```powershell
   npm run telegram:chat-id
   ```
   Скопируйте строку `TELEGRAM_CHAT_ID=…` у @Patrick_1208 в `.env.local`.

## 2. Хостинг Vercel (бесплатно)
1. Войдите в Vercel. Откроется браузер: зарегистрируйтесь или войдите через почту, GitHub или Google.
   ```powershell
   npx vercel login
   ```
2. Первая загрузка. На вопросы отвечайте: *Set up and deploy?* → **Y**, *Link to existing project?* → **N**,
   имя проекта → **velmor-perfumes**, папка → **./** (Enter), *Modify settings?* → **N**.
   ```powershell
   npx vercel
   ```
3. Передайте Vercel секреты бота. Каждая команда попросит вставить значение из `.env.local`.
   ```powershell
   npx vercel env add TELEGRAM_BOT_TOKEN production
   ```
   ```powershell
   npx vercel env add TELEGRAM_CHAT_ID production
   ```
4. Финальная публикация:
   ```powershell
   npx vercel --prod
   ```
   В конце будет адрес вида **https://velmor-perfumes.vercel.app**. Это адрес вашего сайта.

## 3. Кнопка «Магазин» в боте
1. **@BotFather** → `/mybots` → ваш бот → **Bot Settings** → **Menu Button** → **Configure menu button**.
2. Отправьте адрес сайта (`https://velmor-perfumes.vercel.app`), затем название кнопки: **Магазин**.
3. Откройте бота: слева от поля ввода появится кнопка **Магазин**, сайт откроется прямо в Telegram.

## Проверка
Оформите тестовый заказ. @Patrick_1208 должен получить сообщение от бота с именем, телефоном и составом заказа.

## Обновление сайта
После любых изменений (цены, фото, тексты) снова выполните:
```powershell
npx vercel --prod
```
