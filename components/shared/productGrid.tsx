// components/shared/ProductGrid.tsx
"use client"
import React, { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ProductCard from "./productCard"
import type { Electrodomestico } from "@/contexts/products-context"

type Props = {
  items: Electrodomestico[]
  onItemClick?: (p: Electrodomestico) => void
  admin?: boolean
  onEdit?: (p: Electrodomestico) => void
  onToggleDisponibilidad?: (id: number) => void
  onDelete?: (id: number) => void
  animKey?: string
  categorySelected?: string | null
  setCategory?: (c: string | null) => void
}

export default function ProductGrid({
  items,
  onItemClick,
  admin = false,
  onEdit,
  onToggleDisponibilidad,
  onDelete,
  animKey = "",
  categorySelected,
}: Props) {

  // productos filtrados según categorySelected (si aplica)
  const filteredItems = useMemo(() => {
    if (!categorySelected) return items
    return items.filter((it) => it.categoria === categorySelected)
  }, [items, categorySelected])

  // agrupación por categoría (útil para la vista móvil cuando no hay filtro)
  const itemsByCategory = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const cat = item.categoria ?? "Sin categoría"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, Electrodomestico[]>)
  }, [filteredItems])

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.25, ease: "easeOut" },
  } as const

  return (
    <div>
      {/* ---------- Desktop: 4 columnas (visible en lg+) ---------- */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6">
        <AnimatePresence mode="sync">
          {filteredItems.map((product) => (
            <motion.div key={`${product.id}-${animKey}`} {...motionProps}>
              <ProductCard
                product={product}
                onClick={onItemClick}
                admin={admin}
                onEdit={onEdit}
                onToggleDisponibilidad={onToggleDisponibilidad}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ---------- Mobile/Tablet: 2 columnas (visible < lg) ---------- */}
      <div className="lg:hidden grid grid-cols-2 gap-3 md:gap-4">
        <AnimatePresence mode="sync">
          {categorySelected ? (
            // Si hay categoría seleccionada, mostramos la lista plana (2 cols)
            filteredItems.map((product) => (
              <motion.div key={`${product.id}-${animKey}`} {...motionProps}>
                <ProductCard
                  product={product}
                  onClick={onItemClick}
                  admin={admin}
                  onEdit={onEdit}
                  onToggleDisponibilidad={onToggleDisponibilidad}
                  onDelete={onDelete}
                  /* si tu ProductCard soporta prop `compact`, puedes enviarla:
                     compact
                   */
                />
              </motion.div>
            ))
          ) : (
            // Si NO hay categoría seleccionada, agrupamos por categoría y mostramos encabezado
            // Para cada categoría mostramos un bloque que ocupa las 2 columnas (col-span-2)
            (Object.entries(itemsByCategory) as [string, Electrodomestico[]][]).flatMap(
              ([category, products]) => {
                return [
                  // header del grupo (ocupa ambas columnas)
                  <div key={`heading-${category}`} className="col-span-2 px-1">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground">{category}</h3>
                  </div>,
                  // los productos de la categoría (cada uno ocupa 1 columna dentro del grid)
                  ...products.map((product) => (
                    <motion.div key={`${product.id}-${animKey}`} {...motionProps}>
                      <ProductCard
                        product={product}
                        onClick={onItemClick}
                        admin={admin}
                        onEdit={onEdit}
                        onToggleDisponibilidad={onToggleDisponibilidad}
                        onDelete={onDelete}
                        /* compact si aplica */
                      />
                    </motion.div>
                  )),
                ]
              }
            )
          )}
        </AnimatePresence>
      </div>

      {/* mensaje de vacío (opcional) */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}
