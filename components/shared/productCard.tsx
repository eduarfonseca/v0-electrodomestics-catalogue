"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Electrodomestico } from "@/contexts/products-context"

type Props = {
  product: Electrodomestico
  onClick?: (p: Electrodomestico) => void
  admin?: boolean
  onEdit?: (p: Electrodomestico) => void
  onToggleDisponibilidad?: (id: number) => void
  onDelete?: (id: number) => void
}

export default function ProductCard({
  product,
  onClick,
  admin = false,
  onEdit,
  onToggleDisponibilidad,
  onDelete,
}: Props) {
  const router = useRouter()

  const handleCardClick = () => {
    if (admin) return
    try { onClick?.(product) } catch (err) { console.error(err) }

    try {
      if (typeof window !== "undefined") {
        const key = `catalog-scroll:${window.location.pathname}${window.location.search}`
        const y = window.scrollY ?? window.pageYOffset ?? 0
        sessionStorage.setItem(key, String(Math.floor(y)))
      }
    } catch (e) { console.warn("No se pudo guardar scroll:", e) }

    router.push(`/producto/${encodeURIComponent(String(product.id))}`)
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:scale-[1.02] bg-card ${admin ? "" : "cursor-pointer"}`}
      onClick={() => handleCardClick()}
    >
      {/* Imagen: relación y cover (dejado como en la versión que te gustó) */}
      <div className="aspect-[3/4] relative bg-gray-50">
        <div
          className="w-full h-full rounded-t-lg bg-white bg-no-repeat"
          style={{
            backgroundImage: `url(${product.imagenURL || "/public/placeholder-prs7q.png"})`,
            backgroundSize: "cover",
            backgroundPosition: "50% 45%",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute top-1 right-3">
          <Badge
            variant={product.disponible ? "default" : "secondary"}
            className={`flex-1 ${product.disponible ? "bg-green-100 text-green-800" : "bg-red-50 text-red-600"}`}
          >
            {product.disponible ? "Disponible" : "Agotado"}
          </Badge>
        </div>
      </div>

      {/* Header con título y subtítulo (tamaños reducidos) */}
      <CardHeader className="pb-1 px-4">
        <CardTitle
          className="font-semibold text-foreground line-clamp-2 leading-tight"
          style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)" }} /* más pequeño: ~15px → ~18px */
        >
          {product.nombre}
        </CardTitle>

        <CardDescription
          className="text-muted-foreground"
          style={{ fontSize: "clamp(0.75rem, 0.95vw, 0.85rem)" }} /* ~12px → ~14px */
        >
          {product.marca} • {product.categoria}
        </CardDescription>
      </CardHeader>

      {/* Contenido: precios con escala reducida para no dominar la tarjeta */}
      <CardContent className="pt-0 pb-1 px-4">
        <div className="grid grid-cols-2 gap-3 items-start">
          <div className="space-y-0 text-muted-foreground">
            <div className="font-medium" style={{ fontSize: "clamp(0.72rem, 0.9vw, 0.85rem)" }}>
              Precio Minorista
            </div>
            <p
              className="font-semibold text-foreground leading-tight"
              style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)" }} /* reducido: ~17px → ~21px */
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
              style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)" }} /* reducido y emparejado al minorista */
            >
              ${product.precioMayorista}
            </p>
            {/* <span className="block mt-1" style={{ fontSize: "clamp(0.65rem, 0.85vw, 0.8rem)" }}>
              (mínimo {product.cantidadMinimaMayorista || 0} uds.)
            </span> */}
          </div>
        </div>
      </CardContent>

      {/* Footer (botones/acciones). Tamaños conservadores
      {admin ? (
        <CardFooter className="flex items-center justify-evenly gap-2 pt-2 px-6">
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit?.(product) }}
              className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Edit className="h-4 w-4 mr-1" />
            </Button>

            <Button variant={product.disponible ? "destructive" : "default"} size="sm"
              onClick={(e) => { e.stopPropagation(); onToggleDisponibilidad?.(product.id) }}
              className={`px-3 py-1 text-sm ${product.disponible ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {product.disponible ? "Marcar Agotado" : "Marcar Disponible"}
            </Button>
          </div>

          <div className="flex-shrink-0">
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete?.(product.id) }}
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      ) : ( */}
        <CardFooter shareProductId={product.id} shareProductTitle={product.nombre} shareProductText={product.marca} viewProductId={product.id} className="pt-1">
        </CardFooter>
      {/* )} */}
    </Card>
  )
}
