import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/data/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ml?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return { title: p ? `${p.brand} ${p.name}` : undefined };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ml } = await searchParams;
  // черновики (published: false) недоступны даже по прямой ссылке
  if (!getProduct(slug)) notFound();
  const n = ml ? Number(ml) : NaN;
  return <ProductDetail slug={slug} initialMl={Number.isFinite(n) ? n : null} />;
}
