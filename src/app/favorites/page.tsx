import type { Metadata } from "next";
import { FavoritesView } from "@/components/FavoritesView";
import { getDict } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).favorites.title };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
