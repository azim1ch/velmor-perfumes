import { cookies } from "next/headers";
import { dictionaries, isLang, LANG_COOKIE, type Lang } from "./dictionaries";

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "ru";
}

export async function getDict() {
  return dictionaries[await getLang()];
}
