// app/page.tsx (client)
"use client"

import React, { useEffect, useRef, useState } from "react"
import Loading from "./loading"
import FiltersBar from "@/components/shared/filtersBar"
import ProductGrid from "@/components/shared/productGrid"
import { useProducts } from "@/contexts/products-context"
import type { Electrodomestico } from "@/contexts/products-context"
import CatalogHeader from "@/components/catalog-header"
import StoreInfo from "@/components/store-info"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function HomePage() {
  const { electrodomesticos, isLoading } = useProducts()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams?.toString() ?? ""
  const router = useRouter()
  const pathname = usePathname()

  // estados de filtros
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

  // refs/timeouts/animation
  const savedScrollBehaviorRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const fallbackTimeoutRef = useRef<number | null>(null)

  // helper: key para sessionStorage
  const getStorageKey = () => {
    if (typeof window === "undefined") return `catalog-scroll:${pathname}${searchParamsString}`
    return `catalog-scroll:${window.location.pathname}${window.location.search}`
  }

  // easing
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const animateScrollTo = (startY: number, targetY: number, minMs = 320, maxMs = 1000) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (fallbackTimeoutRef.current) {
      window.clearTimeout(fallbackTimeoutRef.current)
      fallbackTimeoutRef.current = null
    }

    const distance = Math.abs(targetY - startY)
    const msPerPx = 0.5
    const computed = Math.round(distance * msPerPx + 160)
    const duration = Math.max(minMs, Math.min(maxMs, computed))

    const t0 = performance.now()
    const tick = (now: number) => {
      const elapsed = now - t0
      const normalized = Math.min(1, elapsed / duration)
      const eased = easeOutCubic(normalized)
      const current = Math.round(startY + (targetY - startY) * eased)
      window.scrollTo(0, current)
      if (normalized < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    fallbackTimeoutRef.current = window.setTimeout(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      window.scrollTo(0, targetY)
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }, duration + 220)
  }

  const restoreScrollAnimated = (maxFrames = 60) => {
    if (typeof window === "undefined") return
    try {
      const storageKey = getStorageKey()
      const raw = sessionStorage.getItem(storageKey)
      const pos = raw ? parseInt(raw, 10) : NaN
      if (isNaN(pos)) return

      try {
        if ("scrollRestoration" in history) {
          ;(history as any).scrollRestoration = "manual"
        }
      } catch (e) {}

      try {
        savedScrollBehaviorRef.current = (document.documentElement.style as any).scrollBehavior || ""
      } catch {
        savedScrollBehaviorRef.current = ""
      }

      const dynamicOffset = Math.min(320, Math.max(120, Math.round(pos * 0.08 + 60)))
      const startY = Math.max(0, pos - dynamicOffset)

      try {
        (document.documentElement.style as any).scrollBehavior = "auto"
      } catch {}
      window.scrollTo(0, startY)

      requestAnimationFrame(() => {
        animateScrollTo(startY, pos, 360, 1000)

        const restoreAfter = 1400 + 200
        const cleanup = window.setTimeout(() => {
          try {
            (document.documentElement.style as any).scrollBehavior = savedScrollBehaviorRef.current || ""
          } catch {}
          try {
            if ("scrollRestoration" in history) {
              ;(history as any).scrollRestoration = "auto"
            }
          } catch {}
          window.clearTimeout(cleanup)
        }, restoreAfter)
      })
    } catch (e) {
      console.warn("restoreScrollAnimated error:", e)
    }
  }

  // inicializar desde searchParams (y restaurar scroll)
  const initializedRef = useRef(false)
  useEffect(() => {
    const q = searchParams?.get("q") ?? ""
    const available = searchParams?.get("available")
    const nameSort = searchParams?.get("name")
    const priceSort = searchParams?.get("price")
    const category = searchParams?.get("category")
    const brand = searchParams?.get("brand")

    setBusqueda(q)
    if (available != null) setAvailableOnly(available === "1" || available === "true")
    if (nameSort != null) setNameSortActive(nameSort === "1" || nameSort === "true")
    if (priceSort != null) setPriceSortActive(priceSort === "1" || priceSort === "true")
    if (category != null) setCategorySelected(category || null)
    if (brand != null) setBrandSelected(brand || null)

    restoreScrollAnimated(60)

    initializedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString])

  // sincronizar estado -> URL (replace para no llenar historial)
  useEffect(() => {
    const params = new URLSearchParams()

    if (busqueda && busqueda.trim() !== "") params.set("q", busqueda.trim())
    params.set("available", availableOnly ? "1" : "0")
    if (nameSortActive) params.set("name", "1")
    if (priceSortActive) params.set("price", "1")
    if (categorySelected) params.set("category", categorySelected)
    if (brandSelected) params.set("brand", brandSelected)

    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname

    router.replace(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, availableOnly, nameSortActive, priceSortActive, categorySelected, brandSelected, pathname])

  // restaurar cuando la página vuelve a mostrarse (back/forward)
  useEffect(() => {
    const onPageShow = (ev: PageTransitionEvent) => {
      restoreScrollAnimated(60)
    }
    const onPopState = () => {
      restoreScrollAnimated(60)
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        restoreScrollAnimated(60)
      }
    }

    window.addEventListener("pageshow", onPageShow)
    window.addEventListener("popstate", onPopState)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("pageshow", onPageShow)
      window.removeEventListener("popstate", onPopState)
      document.removeEventListener("visibilitychange", onVisibility)

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
      try {
        (document.documentElement.style as any).scrollBehavior = savedScrollBehaviorRef.current || ""
      } catch {}
      try {
        if ("scrollRestoration" in history) {
          ;(history as any).scrollRestoration = "auto"
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return <Loading />
  }

  const animKey = `${busqueda}-${nameSortActive}-${priceSortActive}-${availableOnly}-${categorySelected ?? ""}-${brandSelected ?? ""}`

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
    // ProductCard guarda la posición antes de navegar
  }

  return (
    // layout column para que footer quede abajo si el contenido es corto
    <div className="min-h-screen flex flex-col bg-background relative">
      <CatalogHeader />

      {/* main crece y empuja footer abajo */}
      <main className="flex-1 container mx-auto px-6 py-8">
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
      </main>

      {/* footer siempre abajo */}
      <footer>
        <StoreInfo />
      </footer>
    </div>
  )
}
