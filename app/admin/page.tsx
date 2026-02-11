"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import FiltersBar from "@/components/shared/filtersBar"
import ProductTable from "@/components/shared/product-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useProducts } from "@/contexts/products-context"
import type { Electrodomestico } from "@/contexts/products-context"
import PageSizeFilter from "@/components/shared/page-size-filter"
import Loading from "@/app/admin/loading"

import AdminProductForm, { NuevoElectrodomesticoState } from "@/components/admin/admin-product-form"

export default function AdminPanel() {
  const { isAuthenticated, logout, loading } = useAuth()
  const router = useRouter()
  const {
    electrodomesticos,
    agregarElectrodomestico,
    editarElectrodomestico,
    eliminarElectrodomestico,
    toggleDisponibilidad,
    isLoading: productsLoading,
  } = useProducts()

  // ---- estado UI y formulario ----
  const [busqueda, setBusqueda] = useState("")
  const [nuevoElectrodomestico, setNuevoElectrodomestico] = useState<any>({
    nombre: "",
    marca: "",
    categoria: "",
    precio: 0,
    precioMinorista: 0,
    precioMayorista: 0,
    cantidadMinimaMayorista: 0,
    imagen: "",
    descripcion: "",
    disponible: true,
  })
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  // --- categoría: permitir elegir existente o crear nueva ---
  const existingCategories = useMemo(() => {
    const set = new Set<string>()
    electrodomesticos.forEach((p: any) => {
      if (p.categoria) set.add(p.categoria)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [electrodomesticos])

  // filtros y opciones (reutilizamos FiltersBar)
  const [availableOnly, setAvailableOnly] = useState(true)
  const [nameSortActive, setNameSortActive] = useState(false)
  const [priceSortActive, setPriceSortActive] = useState(false)
  const [categorySelected, setCategorySelected] = useState<string | null>(null)
  const [brandSelected, setBrandSelected] = useState<string | null>(null)

  // paginación client-side
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // responsive
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // textarea auto-resize: referencia y efecto PARA QUE SIEMPRE SE LLAME (moved here)
  const descripcionRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    const el = descripcionRef.current
    if (!el) return
    el.style.height = "auto"
    const next = Math.min(el.scrollHeight, 500)
    el.style.height = `${next}px`
  }, [nuevoElectrodomestico.descripcion])

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" ? window.innerWidth < 640 : false)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, loading, router])

  const productosFiltradosOrdenados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    const filtered = electrodomesticos.filter((e: any) => {
      if (availableOnly && !e.disponible) return false
      if (categorySelected && e.categoria !== categorySelected) return false
      if (brandSelected && e.marca !== brandSelected) return false
      if (!q) return true
      return (
        e.nombre?.toLowerCase().includes(q) ||
        e.marca?.toLowerCase().includes(q) ||
        e.categoria?.toLowerCase().includes(q)
      )
    })

    const sorted = filtered.sort((a: any, b: any) => {
      if (nameSortActive) return (a.nombre ?? "").localeCompare(b.nombre ?? "")
      if (priceSortActive) return Number(a.precioMinorista ?? 0) - Number(b.precioMinorista ?? 0)
      return (a.id ?? 0) - (b.id ?? 0)
    })

    return sorted
  }, [electrodomesticos, busqueda, availableOnly, categorySelected, brandSelected, nameSortActive, priceSortActive])

  const totalItems = productosFiltradosOrdenados.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return productosFiltradosOrdenados.slice(start, start + pageSize)
  }, [productosFiltradosOrdenados, currentPage, pageSize])

  const iniciarEdicion = (electrodomestico: any) => {
    setNuevoElectrodomestico({
      nombre: electrodomestico.nombre ?? "",
      marca: electrodomestico.marca ?? "",
      categoria: electrodomestico.categoria ?? "",
      precio: electrodomestico.precio ?? 0,
      imagen: electrodomestico.imagenURL || (electrodomestico.imagenURLs?.[0]) || "",
      precioMinorista: electrodomestico.precioMinorista ?? 0,
      precioMayorista: electrodomestico.precioMayorista ?? 0,
      cantidadMinimaMayorista: electrodomestico.cantidadMinimaMayorista ?? 0,
      descripcion: electrodomestico.descripcion || "",
      disponible: electrodomestico.disponible ?? true,
    })
    setEditandoId(electrodomestico.id)
    setDialogAbierto(true)
  }

  const handleEliminarElectrodomestico = (id: number) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return
    eliminarElectrodomestico(id)
  }

  const handleToggleDisponibilidad = (id: number) => {
    toggleDisponibilidad(id)
  }

  // logout asíncrono y safe
  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      router.push("/")
    }
  }

  const gotoPrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const gotoNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))
  const changePageSize = (n: number) => {
    setPageSize(n)
    setCurrentPage(1)
  }

  if (productsLoading) {
    return <Loading />
  }

  // helper: normalizar payload del formulario y castear a lo que espera la DB/context
  function normalizePayload(p: NuevoElectrodomesticoState): Omit<Electrodomestico, "id"> {
    const imagenURLs = Array.isArray(p.imagenURLs) ? p.imagenURLs.filter(Boolean).map(String) : []
    const firstImage = imagenURLs[0] ?? (p.imagenURL ?? "")

    return {
      // aseguramos strings/nums/bools concretos
      nombre: String(p.nombre ?? ""),
      marca: String(p.marca ?? ""),
      categoria: String(p.categoria ?? ""),
      // ajusta los nombres de campo si tu tipo Electrodomestico usa otros nombres
      precioMinorista: Number(p.precioMinorista ?? 0),
      precioMayorista: Number(p.precioMayorista ?? 0),
      cantidadMinimaMayorista: Number(p.cantidadMinimaMayorista ?? 0),
      descripcion: String(p.descripcion ?? ""),
      disponible: Boolean(p.disponible ?? true),
      // campos de imagen
      imagenURL: String(firstImage ?? ""),
      // @ts-ignore: permitimos imagenURLs adicional en la DB si tu tipo la incluye; si no existe, la propiedad será ignorada por supabase insert/update
      imagenURLs,
    } as unknown as Omit<Electrodomestico, "id">
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Panel de Administración</h1>
            <p className="text-2xs text-muted-foreground">Gestión de productos</p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 rounded-md bg-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600 dark:hover:border-red-600">
              <LogOut className="h-4 w-4 mr-2 text-red-600" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <FiltersBar
            id="admin-search"
            value={busqueda}
            onChange={(v) => {
              setBusqueda(v)
              setCurrentPage(1)
            }}
            placeholder="Buscar productos ..."
            onFocusChange={() => { }}
            enlarged={true}
            expandOnFocus={true}
            availableOnly={availableOnly}
            setAvailableOnly={(v) => { setAvailableOnly(v); setCurrentPage(1) }}
            onNameActiveChange={(a) => {
              setNameSortActive(a)
              if (a) setPriceSortActive(false)
            }}
            onPriceActiveChange={(a) => {
              setPriceSortActive(a)
              if (a) setNameSortActive(false)
            }}
            isMobile={isMobile}
            showAddButton={false}
            brandSelected={brandSelected}
            setBrand={(b) => { setBrandSelected(b); setCurrentPage(1) }}
            categorySelected={categorySelected}
            setCategory={(c) => { setCategorySelected(c); setCurrentPage(1) }}
          />
        </div>

        <div className="bg-card rounded-md border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Productos</h2>
              <p className="text-sm text-muted-foreground">{productosFiltradosOrdenados.length} resultado(s)</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <PageSizeFilter
                  selected={pageSize}
                  onChange={(n) => changePageSize(n)}
                  options={[5, 10, 20]}
                  labelSmall="Filas"
                />
              </div>

              <Button
                variant={"outline"}
                onClick={() => {
                  setEditandoId(null)
                  setNuevoElectrodomestico({
                    nombre: "",
                    marca: "",
                    categoria: "",
                    precio: 0,
                    precioMinorista: 0,
                    precioMayorista: 0,
                    cantidadMinimaMayorista: 0,
                    imagen: "",
                    descripcion: "",
                    disponible: true,
                  })
                  setDialogAbierto(true)
                }}
                className="dark:hover:text:opacity-90 hover:text-foreground dark:text-foreground hover:text-accent-foreground shadow-md dark:bg-accent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>

          <ProductTable
            items={pageItems}
            admin={true}
            onEdit={(p) => iniciarEdicion(p)}
            onToggleDisponibilidad={(id) => handleToggleDisponibilidad(id)}
            onDelete={(id) => handleEliminarElectrodomestico(id)}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={gotoPrev}
                disabled={currentPage <= 1}
                className="px-2 py-1 rounded border disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="px-3 py-1 border rounded text-sm bg-background/30">
                Página {currentPage} / {totalPages}
              </div>
              <button
                onClick={gotoNext}
                disabled={currentPage >= totalPages}
                className="px-2 py-1 rounded border disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {productosFiltradosOrdenados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        )}

        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogContent className="sm:max-w-[640px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editandoId ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {editandoId ? "Modifica los datos del electrodoméstico." : "Completa los datos para agregar un nuevo producto al catálogo."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <AdminProductForm
                initial={editandoId ? electrodomesticos.find((p) => p.id === editandoId) ?? {} : {}}
                bucketName={"Fotos Catalogo"}
                existingCategories={existingCategories}
                onSubmit={async (payload: NuevoElectrodomesticoState) => {
                  const dbPayload = normalizePayload(payload)

                  try {
                    if (editandoId) {
                      await editarElectrodomestico(editandoId, dbPayload)
                      alert("Producto actualizado correctamente")
                    } else {
                      await agregarElectrodomestico(dbPayload)
                      alert("Producto agregado correctamente")
                    }
                    setDialogAbierto(false)
                    setEditandoId(null)
                  } catch (err) {
                    console.error(err)
                    alert("Error guardando producto: " + (err instanceof Error ? err.message : "error"))
                  }
                }}
                onCancel={() => {
                  setDialogAbierto(false)
                  setEditandoId(null)
                }}
              />
            </div>

            <DialogFooter>
              {/* El formulario incluye los botones; dejamos el footer vacío */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
