"use client";

import type { ReactNode } from "react";
import { getProduct } from "@/data/catalog";
import {
  ACCORD_COLORS,
  ACCORD_UZ,
  FAMILY_UZ,
  FRAGRANTICA_SNAPSHOT,
  getFragranceInfo,
  NOTE_UZ,
  type FragranceInfo,
  type VoteBar,
} from "@/data/fragrance-info";
import type { Lang } from "@/i18n/dictionaries";
import { useLang } from "@/i18n/LangProvider";
import { groupDigits } from "@/lib/format";
import { ArrowIcon } from "./Icons";

const REACTION_COLORS = ["#FF7A72", "#E67CC1", "#F2A58E", "#8391E3", "#7C8AA6"];
const WHEN_COLORS = ["#7FD3EC", "#A6DE85", "#F28B82", "#F6B96B", "#F0A43C", "#8FB0CE"];

/** Блок «Об аромате»: аккорды, оценки и пирамида нот по данным Fragrantica.ru. */
export function FragranceDetails({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const info = getFragranceInfo(slug);
  const product = getProduct(slug);
  if (!info || !product) return null;

  const tr = (dict: Record<string, string>, s: string) => (lang === "uz" ? (dict[s] ?? s) : s);
  const notes = (list: string[]) => list.map((n) => tr(NOTE_UZ, n)).join(", ");

  const pyramid: { label: string; list: string[] }[] = info.notes
    ? [{ label: t.about.notes, list: info.notes }]
    : [
        { label: t.about.top, list: info.top ?? [] },
        { label: t.about.heart, list: info.heart ?? [] },
        { label: t.about.base, list: info.base ?? [] },
      ].filter((l) => l.list.length > 0);

  return (
    <section aria-labelledby="about-title" className="mt-14 border-t border-line/70 pt-10 sm:mt-20">
      <h2 id="about-title" className="font-serif text-[32px] font-medium text-cream sm:text-4xl">
        {t.about.title}
      </h2>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        {/* Описание + аккорды */}
        <div>
          <p className="max-w-xl text-[15px] leading-relaxed text-cream/90 sm:text-base">
            {describe(info, product.brand, product.name, lang)}
          </p>

          <h3 className="eyebrow mt-8">{t.about.accords}</h3>
          <ul className="mt-3 max-w-[460px] space-y-1">
            {info.accords.map(([name, pct]) => {
              const [bg, fg] = ACCORD_COLORS[name] ?? ["#5A544C", "#F4EEE4"];
              return (
                <li key={name}>
                  <div
                    className="flex h-8 items-center justify-center rounded-r-md px-2 text-[14px] font-semibold"
                    style={{ width: `${Math.max(pct, 34)}%`, background: bg, color: fg }}
                  >
                    <span className="truncate">{tr(ACCORD_UZ, name)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Оценки пользователей */}
        {(info.reactions || info.when || info.rating) && (
          <div>
            <h3 className="eyebrow">{t.about.userVotes}</h3>
            <div className="mt-3 space-y-3">
              {info.reactions && (
                <VoteCard title={t.about.reactions} titleIcon={<HeartMini />} cols={5}>
                  {info.reactions.map((bar, i) => (
                    <VoteColumn
                      key={i}
                      icon={<Face mood={i} />}
                      label={t.about.reactionLabels[i]}
                      bar={bar}
                      color={REACTION_COLORS[i]}
                    />
                  ))}
                </VoteCard>
              )}
              {info.when && (
                <VoteCard title={t.about.when} titleIcon={<ClockMini />} cols={6}>
                  {info.when.map((bar, i) => (
                    <VoteColumn
                      key={i}
                      icon={<WhenIcon i={i} />}
                      label={t.about.whenLabels[i]}
                      bar={bar}
                      color={WHEN_COLORS[i]}
                    />
                  ))}
                </VoteCard>
              )}
            </div>
            {info.rating && (
              <p className="mt-4 text-center text-[14px] text-muted">
                {t.about.rating}{" "}
                <span className="text-[16px] font-semibold text-gold">{info.rating.value.toFixed(2)}</span> {t.about.of5}
                <span aria-hidden> · </span>
                {t.about.votes}: <span className="font-semibold text-cream">{groupDigits(info.rating.votes)}</span>
                <span aria-hidden> · </span>
                {t.about.reviews}: <span className="font-semibold text-cream">{info.rating.reviews}</span>
                <span className="mt-1 block text-[12px] text-muted/80">
                  {t.about.snapshot} {FRAGRANTICA_SNAPSHOT}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Пирамида нот */}
      <h3 className="eyebrow mt-10">{t.about.pyramid}</h3>
      <dl className={`mt-3 grid gap-3 ${pyramid.length > 1 ? "md:grid-cols-3" : ""}`}>
        {pyramid.map((l) => (
          <div key={l.label} className="rounded-sm bg-surface p-4 sm:p-5">
            <dt className="font-serif text-[20px] text-gold">{l.label}</dt>
            <dd className="mt-1.5 text-[15px] leading-relaxed text-cream">{notes(l.list)}</dd>
          </div>
        ))}
      </dl>

      <a
        href={info.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 py-1 text-[13px] text-muted underline-offset-4 transition-colors hover:text-gold hover:underline"
      >
        {t.about.source}
        <ArrowIcon className="h-3.5 w-3.5" />
      </a>
    </section>
  );
}

/** Короткое описание собирается из фактов (текст Fragrantica не копируется). */
function describe(info: FragranceInfo, brand: string, name: string, lang: Lang): ReactNode {
  const title = (
    <strong className="font-semibold text-cream">
      {brand} {name}
    </strong>
  );
  const perfumers = info.perfumers?.length ? info.perfumers.join(lang === "ru" ? " и " : " va ") : null;
  const many = (info.perfumers?.length ?? 0) > 1;

  if (lang === "uz") {
    const g = { men: "erkaklar uchun", women: "ayollar uchun", unisex: "erkaklar va ayollar uchun" }[info.gender];
    return (
      <>
        {title} — {g} atir, «{FAMILY_UZ[info.family] ?? info.family}» guruhiga mansub.
        {info.year ? ` ${info.year}-yilda chiqarilgan.` : ""}
        {perfumers ? ` ${many ? "Parfyumerlar" : "Parfyumer"}: ${perfumers}.` : ""}
      </>
    );
  }
  const g = { men: "для мужчин", women: "для женщин", unisex: "для мужчин и женщин" }[info.gender];
  return (
    <>
      {title} — аромат {g}, относится к группе «{info.family}».
      {info.year ? ` Выпущен в ${info.year} году.` : ""}
      {perfumers ? ` ${many ? "Парфюмеры" : "Парфюмер"}: ${perfumers}.` : ""}
    </>
  );
}

function VoteCard({ title, titleIcon, cols, children }: { title: string; titleIcon: ReactNode; cols: 5 | 6; children: ReactNode }) {
  return (
    <div className="rounded-sm bg-surface">
      <div className="flex items-center gap-2 border-b border-line/70 px-4 py-2.5">
        {titleIcon}
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-cream">{title}</span>
      </div>
      <ul className={`grid gap-1.5 px-2 py-3 sm:gap-3 sm:px-4 ${cols === 5 ? "grid-cols-5" : "grid-cols-6"}`}>{children}</ul>
    </div>
  );
}

function VoteColumn({ icon, label, bar, color }: { icon: ReactNode; label: string; bar: VoteBar; color: string }) {
  const [pct, count] = bar;
  return (
    <li className="flex min-w-0 flex-col items-center text-center">
      <span className="text-muted" aria-hidden>
        {icon}
      </span>
      <span className="mt-1 flex min-h-[28px] items-start text-[11px] leading-tight text-muted sm:text-[12px]">{label}</span>
      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="mt-1 text-[11px] font-semibold tabular-nums sm:text-[12px]" style={{ color }}>
        {count}
      </span>
    </li>
  );
}

// ---------- Небольшие иконки ----------

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6 sm:h-7 sm:w-7",
};

function HeartMini() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#FF7A72]" fill="currentColor" aria-hidden>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  );
}

function ClockMini() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" />
    </svg>
  );
}

/** 0 люблю, 1 нравится, 2 нейтрально, 3 не нравится, 4 ненавижу */
function Face({ mood }: { mood: number }) {
  const mouths = ["M8 14.5c1 2 2.4 3 4 3s3-1 4-3", "M8.5 15c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2", "M9 15.5h6", "M8.5 17c.9-1.3 2.1-2 3.5-2s2.6.7 3.5 2", "M8 17.5c1-2 2.4-3 4-3s3 1 4 3"];
  return (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      {mood === 0 ? (
        <>
          <path d="M8.6 11.2s-1.6-1-1.6-2a.9.9 0 0 1 1.6-.5.9.9 0 0 1 1.6.5c0 1-1.6 2-1.6 2Z" fill="currentColor" />
          <path d="M15.4 11.2s-1.6-1-1.6-2a.9.9 0 0 1 1.6-.5.9.9 0 0 1 1.6.5c0 1-1.6 2-1.6 2Z" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="9" cy="10" r=".9" fill="currentColor" />
          <circle cx="15" cy="10" r=".9" fill="currentColor" />
        </>
      )}
      {mood === 4 && <path d="M7.5 7.8 10 8.8M16.5 7.8 14 8.8" />}
      <path d={mouths[mood]} />
    </svg>
  );
}

/** 0 зима, 1 весна, 2 лето, 3 осень, 4 день, 5 вечер */
function WhenIcon({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <svg {...svg}>
          <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5" />
        </svg>
      );
    case 1:
      return (
        <svg {...svg}>
          <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
          <path d="M5 19 13 11" />
        </svg>
      );
    case 2:
      return (
        <svg {...svg}>
          <path d="M3.5 12a8.5 8.5 0 0 1 17 0Z" />
          <path d="M12 12v7.5a1.5 1.5 0 0 1-3 0" />
        </svg>
      );
    case 3:
      return (
        <svg {...svg}>
          <path d="M12 21v-6M12 15 6.5 12l1.5-1.5L5 8l3-.5L7.5 4 11 6l1-3 1 3 3.5-2-.5 3.5 3 .5-3 2.5 1.5 1.5Z" />
        </svg>
      );
    case 4:
      return (
        <svg {...svg}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      );
    default:
      return (
        <svg {...svg}>
          <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
        </svg>
      );
  }
}
