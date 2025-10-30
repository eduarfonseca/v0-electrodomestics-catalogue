// lib/useUrlFilters.ts
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export type UrlFilters = {
  q?: string
  availableOnly?: boolean
  sort?: "name" | "price" | null
  category?: string | null
  brand?: string | null
  page?: number
  pageSize?: number
}

// parsea search params (puede recibir null)
export function readFiltersFromSearchParams(searchParams: URLSearchParams | null): UrlFilters {
  if (!searchParams) return {}
  const q = searchParams.get("q") ?? ""
  const available = searchParams.get("available")
  const availableOnly = available === null ? true : available === "true"
  const sort = searchParams.get("sort")
  const category = searchParams.get("category") ?? null
  const brand = searchParams.get("brand") ?? null
  const page = Number(searchParams.get("page") ?? "1") || 1
  const pageSize = Number(searchParams.get("pageSize") ?? "10") || 10

  return {
    q,
    availableOnly,
    sort: sort === "name" || sort === "price" ? (sort as "name" | "price") : null,
    category,
    brand,
    page,
    pageSize,
  }
}

/**
 * Hook que sincroniza un objeto filters con la URL (router.replace)
 * - debounceMs: controla debounce para búsquedas (por defecto 300ms)
 */
export function useSyncFiltersToUrl(filters: UrlFilters, debounceMs = 300) {
  const router = useRouter()
  const pathname = usePathname()
  const timerRef = useRef<number | null>(null)
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const sp = new URLSearchParams()
    if (filters.q && String(filters.q).trim() !== "") sp.set("q", String(filters.q))
    // colocamos available siempre (por claridad); si lo prefieres, sólo cuando false
    sp.set("available", filters.availableOnly === false ? "false" : "true")
    if (filters.sort) sp.set("sort", filters.sort)
    if (filters.category) sp.set("category", filters.category)
    if (filters.brand) sp.set("brand", filters.brand)
    if (filters.page && filters.page > 1) sp.set("page", String(filters.page))
    if (filters.pageSize && filters.pageSize !== 10) sp.set("pageSize", String(filters.pageSize))

    const newUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname

    // evitar cambios innecesarios
    if (newUrl === lastUrlRef.current) return

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    timerRef.current = window.setTimeout(() => {
      try {
        // usamos replace para no llenar el historial con cada tecla
        router.replace(newUrl, { scroll: false })
        lastUrlRef.current = newUrl
      } catch (err) {
        console.error("Error replacing url with filters", err)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
    // Dependencias: enumeradas para disparar cuando cambien campos concretos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.q,
    filters.availableOnly,
    filters.sort,
    filters.category,
    filters.brand,
    filters.page,
    filters.pageSize,
    pathname,
    router,
    debounceMs,
  ])
}
