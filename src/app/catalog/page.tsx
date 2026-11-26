import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/CatalogView";
import { getDict } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.catalog.title };
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
