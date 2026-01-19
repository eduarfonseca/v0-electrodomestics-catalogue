// app/producto/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import React from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ShareButton, WhatsAppContactButton } from "@/components/ui/card";
import CatalogHeader from "@/components/catalog-header";
import StoreInfo from "@/components/store-info";
import BackButton from "@/components/back-button";
import ProductCarousel from "@/components/product-carousel";

type Params = { params: { id: string } };

export const dynamic = "force-dynamic";

const DEFAULT_SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://v0-electrodomesticoscatalogue.vercel.app";

function absoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return undefined;
  try {
    const u = new URL(pathOrUrl);
    return u.toString();
  } catch {
    const p = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${DEFAULT_SITE}${p}`;
  }
}

async function getProductoById(id: string) {
  const { data, error } = await supabase
    .from("Producto")
    .select("*")
    .eq("id", Number(id))
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase error fetching product:", error);
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const prod: any = await getProductoById(id);
  if (!prod) {
    return {
      title: "Producto no encontrado",
    };
  }

  const title = prod.nombre ?? "Producto";
  const description = prod.descripcion?.slice(0, 160) ?? `${prod.nombre ?? ""} - ${prod.marca ?? ""}`;
  const imageUrl = absoluteUrl(prod.imagenURL) ?? absoluteUrl("/placeholder.svg");
  const canonicalUrl = `${DEFAULT_SITE}/producto/${encodeURIComponent(String(prod.id))}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: imageUrl ? [{ url: imageUrl, alt: `${prod.nombre} • ${prod.marca}`, width: 1200, height: 630 }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const producto: any = await getProductoById(id);

  if (!producto) {
    notFound();
  }

  const imagenAbsoluta = absoluteUrl(producto.imagenURL) ?? absoluteUrl("/placeholder.svg");
  const canonicalUrl = `${DEFAULT_SITE}/producto/${encodeURIComponent(String(producto.id))}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    image: imagenAbsoluta ? [imagenAbsoluta] : undefined,
    description: producto.descripcion,
    brand: producto.marca ? { "@type": "Brand", name: producto.marca } : undefined,
    sku: producto.sku ?? undefined,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: producto.precioMinorista != null ? String(producto.precioMinorista) : undefined,
      priceCurrency: producto.moneda ?? "USD",
      availability: producto.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    // layout column: main crece y footer queda al final
    <div className="min-h-screen flex flex-col bg-background">
      <CatalogHeader />

      {/* main ocupa el espacio disponible */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton />

        <div className="container mx-auto gap-8 mb-12">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{producto.nombre}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {producto.marca} • {producto.categoria}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ShareButton productId={String(producto.id)} title={producto.nombre} text={producto.marca} />
                <WhatsAppContactButton productId={String(producto.id)} title={producto.nombre} text={producto.marca} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden bg-gray-100 relative aspect-square">
                {/* usar imagenes del producto: preferir imagenURLs si existen */}
                <ProductCarousel
                  images={Array.isArray(producto.imagenURLs) && producto.imagenURLs.length > 0 ? producto.imagenURLs : [producto.imagenURL || "/placeholder.svg"]}
                  alt={producto.nombre}
                  aspectClass="aspect-square"
                  autoplay={true}
                  intervalMs={3500}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <Badge variant="brand" className="text-sm ">
                  {producto.marca}
                </Badge>
                <Badge variant={producto.disponible ? "available" : "unavailable"} className="text-sm">
                  {producto.disponible ? "Disponible" : "Agotado"}
                </Badge>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <div className="text-sm text-muted-foreground">Precio Minorista</div>
                <div className="text-3xl font-bold text-blue-600">${producto.precioMinorista}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Precio Mayorista (mínimo {producto.cantidadMinimaMayorista} uds.)
                </div>
                <div className="text-2xl font-bold text-green-600">${producto.precioMayorista}</div>
              </div>

              <section className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-2">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{producto.descripcion}</p>
              </section>
            </div>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>

      {/* footer se queda al final */}
      <footer>
        <StoreInfo />
      </footer>
    </div>
  );
}
