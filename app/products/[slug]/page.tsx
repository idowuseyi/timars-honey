import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/products";
import { formatNaira } from "@/lib/money";
import { whatsappForProduct } from "@/lib/whatsapp";
import { AddToCartButton } from "@/components/AddToCartButton";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${product.sizeLabel}`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
      <div className="hex flex aspect-square items-center justify-center bg-bark text-honey">
        <span className="font-display text-5xl">{product.name}</span>
      </div>
      <div>
        <h1 className="font-display text-4xl">{product.name}</h1>
        <p className="mt-1 text-comb/60">{product.sizeLabel}</p>
        <p className="mt-4 font-mono text-2xl">{formatNaira(product.priceKobo)}</p>
        <p className="mt-6 max-w-md text-comb/80">{product.description}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <AddToCartButton slug={product.slug} />
          <a
            href={whatsappForProduct(product.name, product.sizeLabel)}
            className="rounded-full border border-comb/20 px-6 py-3 font-semibold text-comb transition-colors hover:border-honey hover:text-honey"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
