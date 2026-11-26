"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { getManagerHandle, getManagerUrl, storeConfig } from "@/config/store";
import { useLang } from "@/i18n/LangProvider";
import { LIMITS, normalizePhone, normalizeTelegram, validateCustomer, type CustomerErrors } from "@/lib/customer";
import { formatPrice, formatVolume } from "@/lib/format";
import { buildOrderMessage, cartTotal, resolveCart, type CustomerDraft } from "@/lib/order";
import { useShop } from "@/store/ShopProvider";
import { ArrowIcon, CheckIcon, CloseIcon, CopyIcon, TelegramIcon } from "./Icons";
import { ProductImage } from "./ProductImage";

type Status = "idle" | "copied" | "copyFailed" | "copiedPaste" | "sendFailed" | "invalid";
type Field = "name" | "phone" | "telegram" | "comment";

const CUSTOMER_KEY = "velmor:customer:v1";
const EMPTY: Record<Field, string> = { name: "", phone: "", telegram: "", comment: "" };

/**
 * Корзина и оформление заказа.
 * botEnabled = true, если на сервере настроен Telegram-бот (тогда заказ уходит менеджеру автоматически).
 */
export function CartView({ botEnabled }: { botEnabled: boolean }) {
  const { t, lang } = useLang();
  const { ready, cart, setQty, removeFromCart, clearCart } = useShop();
  const lines = useMemo(() => resolveCart(cart), [cart]);
  const total = cartTotal(lines);
  const managerHandle = getManagerHandle();

  // --- данные покупателя (запоминаются в браузере для удобства) ---
  const [form, setForm] = useState<Record<Field, string>>(EMPTY);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [touched, setTouched] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CUSTOMER_KEY) ?? "null");
      if (saved && typeof saved === "object") setForm({ ...EMPTY, ...saved });
    } catch {
      /* ничего страшного */
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(form));
    } catch {
      /* приватный режим */
    }
    if (touched) {
      const r = validateCustomer(form);
      setErrors(r.ok ? {} : r.errors);
    }
  }, [form, touched]);

  const draft: CustomerDraft = {
    ...form,
    phone: normalizePhone(form.phone) ?? form.phone,
    telegram: normalizeTelegram(form.telegram) ?? form.telegram,
  };
  const message = useMemo(
    () => buildOrderMessage(lines, lang, draft),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, lang, form.name, form.phone, form.telegram, form.comment],
  );

  const [status, setStatus] = useState<Status>("idle");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null); // номер, по которому свяжутся
  const [botFailed, setBotFailed] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fieldRefs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  useEffect(() => {
    if (status === "copied" || status === "copiedPaste") setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const set = (f: Field) => (e: { target: { value: string } }) => setForm((p) => ({ ...p, [f]: e.target.value }));

  /** Проверка перед любым действием с заказом. Возвращает false и показывает ошибки. */
  const ensureValid = (): boolean => {
    setTouched(true);
    const r = validateCustomer(form);
    if (r.ok) return true;
    setErrors(r.errors);
    setStatus("invalid");
    const first = (["name", "phone", "telegram", "comment"] as Field[]).find((f) => r.errors[f]);
    if (first) fieldRefs.current[first]?.focus();
    return false;
  };

  const selectText = () => {
    const el = textRef.current;
    if (!el) return;
    el.focus();
    el.select();
    el.setSelectionRange(0, el.value.length);
  };

  const copyText = async (): Promise<boolean> => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(message);
      return true;
    } catch {
      /* запасной способ ниже */
    }
    selectText();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  };

  const onCopy = async () => {
    if (!ensureValid()) return;
    setStatus((await copyText()) ? "copied" : "copyFailed");
  };

  const onManagerClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ensureValid()) {
      e.preventDefault();
      return;
    }
    // ссылка откроется сразу; текст заказа параллельно копируем, чтобы его можно было вставить
    void copyText().then((ok) => setStatus(ok ? "copiedPaste" : "idle"));
  };

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!botEnabled) return;
    if (!ensureValid()) return;
    const r = validateCustomer(form);
    if (!r.ok) return;
    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          customer: r.customer,
          items: lines.map((l) => l.item),
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) throw new Error("send failed");
      setSentTo(r.customer.phone);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setBotFailed(true);
      setStatus("sendFailed");
    } finally {
      setSending(false);
    }
  };

  if (!ready) {
    return (
      <div className="container-x pt-6 sm:pt-10">
        <h1 className="font-serif text-4xl font-medium text-cream sm:text-5xl">{t.cart.title}</h1>
        <div className="h-40" aria-busy="true" />
      </div>
    );
  }

  // --- заказ успешно отправлен ботом ---
  if (sentTo) {
    return (
      <div className="container-x pt-10 sm:pt-16">
        <div className="mx-auto max-w-lg rounded-sm bg-surface px-6 py-12 text-center" role="status">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <CheckIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-serif text-4xl text-cream">{t.checkout.sentTitle}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {t.checkout.sentText} <span className="whitespace-nowrap font-semibold text-cream">{sentTo}</span>.
          </p>
          <Link href="/catalog" className="btn-gold mt-8">
            {t.checkout.backToCatalog}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  const useBot = botEnabled && !botFailed;
  const managerUrl = getManagerUrl(message);
  const fieldCls = (bad?: boolean) => `field mt-1.5 ${bad ? "border-[#E8796F] focus:border-[#E8796F]" : ""}`;
  const err = (f: Field, text: string) =>
    errors[f] ? (
      <span id={`err-${f}`} className="mt-1 block text-[13px] text-[#F0948B]">
        {text}
      </span>
    ) : null;

  return (
    <div className="container-x pt-6 sm:pt-10">
      <h1 className="mb-6 font-serif text-4xl font-medium text-cream sm:text-5xl">{t.cart.title}</h1>

      {lines.length === 0 ? (
        <div className="rounded-sm bg-surface px-6 py-14 text-center">
          <p className="text-[16px] text-muted">{t.cart.empty}</p>
          <Link href="/catalog" className="btn-gold mt-6">
            {t.home.cta}
            <ArrowIcon />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:gap-12">
          <ul className="h-fit divide-y divide-line/70 border-y border-line/70">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-3 py-4 sm:gap-5">
                <Link href={`/product/${l.product.slug}?ml=${l.item.ml}`} className="w-[76px] shrink-0 sm:w-[104px]">
                  <ProductImage product={l.product} variant="thumb" sizes="104px" className="rounded-sm" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="eyebrow">{l.product.brand}</p>
                      <Link
                        href={`/product/${l.product.slug}?ml=${l.item.ml}`}
                        className="mt-0.5 block font-serif text-[20px] leading-tight text-cream hover:text-gold sm:text-[22px]"
                      >
                        {l.product.name}
                      </Link>
                      <p className="mt-1 text-[14px] text-muted">
                        {formatVolume(l.item.ml, lang)} · {formatPrice(l.unitPrice, lang)} {t.cart.each}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(l.item.slug, l.item.ml)}
                      aria-label={`${t.cart.remove}: ${l.product.brand} ${l.product.name}, ${formatVolume(l.item.ml, lang)}`}
                      title={t.cart.remove}
                      className="-mr-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-cream"
                    >
                      <CloseIcon className="h-[18px] w-[18px]" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <div className="inline-flex items-center rounded-sm border border-line" role="group" aria-label={t.cart.qty}>
                      <button
                        type="button"
                        onClick={() => setQty(l.item.slug, l.item.ml, l.item.qty - 1)}
                        aria-label={t.cart.decrease}
                        className="h-10 w-10 text-lg text-cream hover:text-gold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-[15px] font-semibold" aria-live="polite">
                        {l.item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(l.item.slug, l.item.ml, l.item.qty + 1)}
                        aria-label={t.cart.increase}
                        disabled={l.item.qty >= 99}
                        className="h-10 w-10 text-lg text-cream hover:text-gold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-right text-[16px] font-semibold text-cream">{formatPrice(l.lineTotal, lang)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-sm bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-4">
              <span className="text-[16px] text-muted">{t.cart.total}</span>
              <span className="text-[26px] font-semibold text-cream" data-testid="cart-total">
                {formatPrice(total, lang)}
              </span>
            </div>

            <form onSubmit={onSend} noValidate className="mt-5">
              <h2 className="font-serif text-2xl text-cream">{t.checkout.title}</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.checkout.hint}</p>

              <div className="mt-4 space-y-3.5">
                <label className="block">
                  <span className="text-[13px] font-medium text-cream">
                    {t.checkout.name} <span className="text-gold">*</span>
                  </span>
                  <input
                    ref={(el) => {
                      fieldRefs.current.name = el;
                    }}
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    required
                    placeholder={t.checkout.namePh}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    className={fieldCls(errors.name)}
                  />
                  {err("name", t.checkout.errName)}
                </label>

                <label className="block">
                  <span className="text-[13px] font-medium text-cream">
                    {t.checkout.phone} <span className="text-gold">*</span>
                  </span>
                  <input
                    ref={(el) => {
                      fieldRefs.current.phone = el;
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    onFocus={() => !form.phone && setForm((p) => ({ ...p, phone: "+998 " }))}
                    onBlur={() => {
                      const n = normalizePhone(form.phone);
                      if (n) setForm((p) => ({ ...p, phone: n }));
                      else if (form.phone.trim() === "+998") setForm((p) => ({ ...p, phone: "" }));
                    }}
                    required
                    placeholder={t.checkout.phonePh}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    className={fieldCls(errors.phone)}
                  />
                  {err("phone", t.checkout.errPhone)}
                </label>

                <label className="block">
                  <span className="text-[13px] font-medium text-cream">
                    {t.checkout.telegram} <span className="font-normal text-muted">({t.checkout.optional})</span>
                  </span>
                  <input
                    ref={(el) => {
                      fieldRefs.current.telegram = el;
                    }}
                    value={form.telegram}
                    onChange={set("telegram")}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={LIMITS.telegram + 13}
                    placeholder={t.checkout.telegramPh}
                    aria-invalid={!!errors.telegram}
                    aria-describedby={errors.telegram ? "err-telegram" : undefined}
                    className={fieldCls(errors.telegram)}
                  />
                  {err("telegram", t.checkout.errTelegram)}
                </label>

                <label className="block">
                  <span className="text-[13px] font-medium text-cream">
                    {t.checkout.comment} <span className="font-normal text-muted">({t.checkout.optional})</span>
                  </span>
                  <textarea
                    ref={(el) => {
                      fieldRefs.current.comment = el;
                    }}
                    value={form.comment}
                    onChange={set("comment")}
                    rows={2}
                    maxLength={LIMITS.comment}
                    placeholder={t.checkout.commentPh}
                    className={`${fieldCls(errors.comment)} h-auto resize-none py-2.5`}
                  />
                  {err("comment", t.checkout.errComment)}
                </label>

                {/* ловушка для спам-ботов: человеку не видна */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
              </div>

              <label className="mt-5 block">
                <span className="eyebrow">{t.cart.orderTextLabel}</span>
                <textarea
                  ref={textRef}
                  readOnly
                  value={message}
                  rows={Math.min(12, lines.length + 4 + (form.name || form.phone ? 3 : 0))}
                  onFocus={(e) => e.currentTarget.select()}
                  className="mt-2 w-full resize-none rounded-sm border border-line bg-ink/60 p-3 font-sans text-[13px] leading-relaxed text-cream focus:border-gold focus:outline-none"
                />
              </label>

              <div className="mt-4 flex flex-col gap-2.5">
                {useBot && (
                  <button type="submit" className="btn-gold w-full" disabled={sending} aria-busy={sending}>
                    <TelegramIcon className="h-5 w-5" />
                    {sending ? t.checkout.sending : t.checkout.send}
                  </button>
                )}
                {useBot && managerHandle && (
                  <p className="pt-1 text-center text-[12px] uppercase tracking-[0.14em] text-muted">{t.checkout.orOther}</p>
                )}
                {managerUrl && managerHandle && (
                  <a
                    href={managerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onManagerClick}
                    className={useBot ? "btn-outline w-full" : "btn-gold w-full"}
                  >
                    <TelegramIcon className={`h-5 w-5 ${useBot ? "text-gold" : ""}`} />
                    {t.cart.writeManager} {managerHandle}
                  </a>
                )}
                <button type="button" onClick={onCopy} className="btn-outline w-full">
                  {status === "copied" ? <CheckIcon className="h-5 w-5 text-gold" /> : <CopyIcon className="h-5 w-5 text-gold" />}
                  {t.cart.copy}
                </button>
                <a
                  href={storeConfig.telegramChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 text-[14px] text-muted transition-colors hover:text-gold"
                >
                  <TelegramIcon className="h-4 w-4" />
                  {t.cart.openChannel}
                </a>
              </div>

              <p role="status" aria-live="polite" className="mt-2 min-h-[20px] text-[14px]">
                {status === "copied" && (
                  <span className="inline-flex items-center gap-1.5 text-gold">
                    <CheckIcon className="h-4 w-4" />
                    {t.cart.copied}
                  </span>
                )}
                {status === "copiedPaste" && <span className="text-gold">{t.checkout.copiedPaste}</span>}
                {status === "copyFailed" && <span className="text-cream">{t.cart.copyFailed}</span>}
                {status === "sendFailed" && <span className="text-[#F0948B]">{t.checkout.sendFailed}</span>}
                {status === "invalid" && Object.keys(errors).length > 0 && (
                  <span className="text-[#F0948B]">{t.checkout.fixErrors}</span>
                )}
              </p>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
