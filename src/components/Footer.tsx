"use client";

import { storeConfig } from "@/config/store";
import type { Lang } from "@/i18n/dictionaries";
import { useLang } from "@/i18n/LangProvider";
import { Logo } from "./Header";
import { TelegramIcon } from "./Icons";

export function LangSwitch() {
  const { lang, setLang, t } = useLang();
  const opts: { v: Lang; label: string; full: string }[] = [
    { v: "ru", label: "RU", full: "Русский" },
    { v: "uz", label: "UZ", full: "O‘zbekcha" },
  ];
  return (
    <div role="group" aria-label={t.footer.language} className="inline-flex rounded-sm border border-line p-0.5">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          lang={o.v}
          aria-pressed={lang === o.v}
          aria-label={o.full}
          onClick={() => lang !== o.v && setLang(o.v)}
          className={`h-9 min-w-[48px] rounded-[2px] px-3 text-[13px] font-semibold tracking-wider transition-colors ${
            lang === o.v ? "bg-gold text-ink" : "text-muted hover:text-cream"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-20 border-t border-line/70">
      <div className="container-x flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-[13px] text-muted">© {new Date().getFullYear()} {storeConfig.name}</p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <a
            href={storeConfig.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-[15px] text-cream transition-colors hover:text-gold"
          >
            <TelegramIcon className="h-5 w-5 text-gold" />
            <span>
              <span className="block text-[12px] text-muted">{t.footer.channel}</span>
              {storeConfig.telegramChannelHandle}
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted">{t.footer.language}</span>
            <LangSwitch />
          </div>
        </div>
      </div>
    </footer>
  );
}
