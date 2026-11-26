"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, LANG_COOKIE, type Dict, type Lang } from "./dictionaries";

type LangCtx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      router.refresh(); // обновить серверные части (заголовки страниц)
    },
    [router],
  );

  return <Ctx.Provider value={{ lang, t: dictionaries[lang], setLang }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used inside LangProvider");
  return v;
}
