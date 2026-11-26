import Link from "next/link";
import { getDict } from "@/i18n/server";

export default async function NotFound() {
  const t = await getDict();
  return (
    <div className="container-x py-24 text-center">
      <p className="font-serif text-6xl text-gold">404</p>
      <h1 className="mt-3 font-serif text-3xl text-cream">{t.notFound.title}</h1>
      <Link href="/catalog" className="btn-gold mt-8">
        {t.notFound.back}
      </Link>
    </div>
  );
}
