// app/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import ContactBubble from "@/components/contact-bubble"
import { ProductPreviewModal } from "@/components/product-preview-modal"
import FiltersBar from "@/components/shared/filtersBar"
import ProductGrid from "@/components/shared/productGrid"
import { useProducts } from "@/contexts/products-context"
import type { Electrodomestico } from "@/contexts/products-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import CatalogHeader from "@/components/catalog-header"
import StoreInfo from "@/components/store-info"

export default function HomePage() {
  const { electrodomesticos } = useProducts()
  const [busqueda, setBusqueda] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Electrodomestico | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [availableOnly, setAvailableOnly] = useState(true)
  const [nameSortActive, setNameSortActive] = useState(false)
  const [priceSortActive, setPriceSortActive] = useState(false)
  const [categorySelected, setCategorySelected] = useState<string | null>(null)
  const [brandSelected, setBrandSelected] = useState<string | null>(null)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const animKey = `${busqueda}-${nameSortActive}-${priceSortActive}-${availableOnly}`

  const electrodomesticosFiltrados = electrodomesticos
    .filter((e) => {
      if (availableOnly && !e.disponible) return false
      if (categorySelected && e.categoria !== categorySelected) return false
      if (brandSelected && e.marca !== brandSelected) return false
      const q = busqueda.toLowerCase().trim()
      if (!q) return true
      return (
        e.nombre.toLowerCase().includes(q) ||
        e.marca.toLowerCase().includes(q) ||
        e.categoria.toLowerCase().includes(q)
      )
    })

  const handleProductClick = (p: Electrodomestico) => {
    setSelectedProduct(p)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader />

      <div className="container mx-auto px-6 py-8">
        <FiltersBar
          id="home-search"
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar productos"
          onFocusChange={() => { }}
          enlarged={true}
          expandOnFocus={true}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          onNameActiveChange={(a) => setNameSortActive(a)}
          onPriceActiveChange={(a) => setPriceSortActive(a)}
          isMobile={isMobile}
          showAddButton={false}
          categorySelected={categorySelected}
          setCategory={setCategorySelected}
          brandSelected={brandSelected}
          setBrand={setBrandSelected}
        />

        <ProductGrid items={electrodomesticosFiltrados} onItemClick={handleProductClick} animKey={animKey} />

        {electrodomesticosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}
      </div>

      <ProductPreviewModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* <ContactBubble /> */}
      <footer>
        <StoreInfo />
      </footer>
    </div>
  )
}
