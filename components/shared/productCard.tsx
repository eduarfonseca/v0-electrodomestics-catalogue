"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import ProductCarousel from "@/components/product-carousel";
import type { Electrodomestico } from "@/contexts/products-context";

type Props = {
  product: Electrodomestico;
  onClick?: (p: Electrodomestico) => void;
  admin?: boolean;
  onEdit?: (p: Electrodomestico) => void;
  onToggleDisponibilidad?: (id: number) => void;
  onDelete?: (id: number) => void;
  carouselAutoplay?: boolean; // <-- nueva prop para controlar autoplay desde quien use ProductCard
};

export default function ProductCard({
  product,
  onClick,
  admin = false,
  onEdit,
  onToggleDisponibilidad,
  onDelete,
  carouselAutoplay = false,
}: Props) {
  const router = useRouter();

  const handleCardClick = () => {
    if (admin) return;
    try {
      onClick?.(product);
    } catch (err) {
      console.error(err);
    }

    try {
      if (typeof window !== "undefined") {
        const key = `catalog-scroll:${window.location.pathname}${window.location.search}`;
        const y = window.scrollY ?? window.pageYOffset ?? 0;
        sessionStorage.setItem(key, String(Math.floor(y)));
      }
    } catch (e) {
      console.warn("No se pudo guardar scroll:", e);
    }

    router.push(`/producto/${encodeURIComponent(String(product.id))}`);
  };

  // Normalizar imágenes: preferir imagenURLs (array), sino imagenURL o imagen como fallback
  const images: string[] = (() => {
    const maybe =
      (product as any).imagenURLs ??
      (product as any).imagenUrls ??
      (product as any).imagen_urls;
    if (Array.isArray(maybe) && maybe.length > 0) {
      return maybe.map((x) => String(x).trim()).filter(Boolean);
    }
    const single =
      product.imagenURL ??
      (product as any).imagen ??
      (product as any).imagenUrl ??
      (product as any).image;
    if (single && typeof single === "string") return [single.trim()];
    return [];
  })();

  // fallback image if no images found
  const finalImages = images.length > 0 ? images : ["/public/placeholder-prs7q.png"];

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:scale-[1.02] bg-card ${
        admin ? "" : "cursor-pointer"
      }`}
      onClick={() => handleCardClick()}
    >
      {/* Imagen: ahora con carrusel */}
      <div className="relative">
        <div className="aspect-[3/4]">
          <ProductCarousel
            images={finalImages}
            alt={product.nombre}
            aspectClass="aspect-[3/4]"
            autoplay={carouselAutoplay}
            intervalMs={3000}
            showControls={true}
            showIndicators={true}
          />
        </div>

        <div className="absolute top-1 right-3">
          <Badge
            variant={product.disponible ? "default" : "secondary"}
            className={`flex-1 ${
              product.disponible ? "bg-green-100 text-green-800" : "bg-red-50 text-red-600"
            }`}
          >
            {product.disponible ? "Disponible" : "Agotado"}
          </Badge>
        </div>
      </div>

      {/* Header con título y subtítulo (tamaños reducidos) */}
      <CardHeader className="px-4">
        <CardTitle
          className="font-semibold text-foreground line-clamp-2 leading-tight"
          style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)" }}
        >
          {product.nombre}
        </CardTitle>
{/* 
        <CardDescription
          className="text-muted-foreground"
          style={{ fontSize: "clamp(0.75rem, 0.95vw, 0.85rem)" }}
        >
          {product.marca} • {product.categoria}
        </CardDescription> */}
      </CardHeader>

      {/* Contenido: precios con escala reducida para no dominar la tarjeta */}
      <CardContent className="pt-0 px-4">
        <div className="grid grid-cols-2 gap-3 items-start">
          <div className="space-y-0 text-muted-foreground">
            <div className="font-medium" style={{ fontSize: "clamp(0.72rem, 0.9vw, 0.85rem)" }}>
              Precio Minorista
            </div>
            <p
              className="font-semibold text-foreground leading-tight"
              style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)" }}
            >
              ${product.precioMinorista}
            </p>
          </div>

          <div className="ml-auto space-y-0 text-muted-foreground text-right">
            <div className="font-medium" style={{ fontSize: "clamp(0.72rem, 0.9vw, 0.85rem)" }}>
              Precio Mayorista
            </div>
            <p
              className="font-medium text-green-600 leading-tight"
              style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)" }}
            >
              ${product.precioMayorista}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer (acciones admin comentadas, por si se reactiva) */}
      {/* {admin ? ( ... ) : ( ... ) } */}
      <CardFooter
        shareProductId={product.id}
        shareProductTitle={product.nombre}
        shareProductText={product.marca}
        viewProductId={product.id}
        className="pt-1"
      />
    </Card>
  );
}
