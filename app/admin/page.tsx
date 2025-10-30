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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProducts } from "@/contexts/products-context"
import type { Electrodomestico } from "@/contexts/products-context"
import PageSizeFilter from "@/components/shared/page-size-filter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type NuevoElectrodomesticoState = {
  nombre: string
  marca: string
  categoria: string
  precio?: number | string
  precioMinorista?: number | string
  precioMayorista?: number | string
  cantidadMinimaMayorista?: number | string
  imagen?: string
  descripcion?: string
  disponible?: boolean
}

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [nuevoElectrodomestico, setNuevoElectrodomestico] = useState<NuevoElectrodomesticoState>({
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
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const existingCategories = useMemo(() => {
    const set = new Set<string>()
    electrodomesticos.forEach((p) => {
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
    // reset height to auto to correctly measure scrollHeight
    el.style.height = "auto"
    const next = Math.min(el.scrollHeight, 500) // limitar altura máxima (ajustable)
    el.style.height = `${next}px`
  }, [nuevoElectrodomestico.descripcion])

  // effect: detectar mobile/responsive
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" ? window.innerWidth < 640 : false)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // redirect si no está autenticado (efecto). dejamos el redirect aquí,
  // y en el render mostramos una pantalla de "verificando" para mantener hooks estables.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // hacemos push (podría ser redundante si el provider ya lo hace)
      router.push("/admin/login")
    }
  }, [isAuthenticated, loading, router])

  // ---- filtrado y orden (usar useMemo para optimizar) ----
  const productosFiltradosOrdenados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    const filtered = electrodomesticos.filter((e) => {
      if (availableOnly && !e.disponible) return false
      if (categorySelected && e.categoria !== categorySelected) return false
      if (brandSelected && e.marca !== brandSelected) return false
      if (!q) return true
      return (
        e.nombre.toLowerCase().includes(q) ||
        e.marca.toLowerCase().includes(q) ||
        e.categoria.toLowerCase().includes(q)
      )
    })

    const sorted = filtered.sort((a, b) => {
      if (nameSortActive) return a.nombre.localeCompare(b.nombre)
      if (priceSortActive) return Number(a.precioMinorista ?? 0) - Number(b.precioMinorista ?? 0)
      return (a.id ?? 0) - (b.id ?? 0)
    })

    return sorted
  }, [electrodomesticos, busqueda, availableOnly, categorySelected, brandSelected, nameSortActive, priceSortActive])

  // recalcular páginas cuando cambian resultados o pageSize
  const totalItems = productosFiltradosOrdenados.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  useEffect(() => {
    // si la página actual queda fuera por el filtrado, volver a la primera
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return productosFiltradosOrdenados.slice(start, start + pageSize)
  }, [productosFiltradosOrdenados, currentPage, pageSize])

  // ---- funciones CRUD y handlers ----
  const iniciarEdicion = (electrodomestico: any) => {
    setNuevoElectrodomestico({
      nombre: electrodomestico.nombre ?? "",
      marca: electrodomestico.marca ?? "",
      categoria: electrodomestico.categoria ?? "",
      precio: electrodomestico.precio ?? 0,
      imagen: electrodomestico.imagenURL || electrodomestico.imagen || "",
      precioMinorista: electrodomestico.precioMinorista ?? 0,
      precioMayorista: electrodomestico.precioMayorista ?? 0,
      cantidadMinimaMayorista: electrodomestico.cantidadMinimaMayorista ?? 0,
      descripcion: electrodomestico.descripcion || "",
      disponible: electrodomestico.disponible ?? true,
    })
    setEditandoId(electrodomestico.id)
    // si la categoría no está en el listado existente, mostrar input (custom)
    setIsCustomCategory(!existingCategories.includes(electrodomestico.categoria ?? ""))
    setDialogAbierto(true)
  }

  const handleAgregarElectrodomestico = async () => {
    try {
      setIsSubmitting(true)
      const payload = {
        ...nuevoElectrodomestico,
        precioMinorista:
          nuevoElectrodomestico.precioMinorista === "" || nuevoElectrodomestico.precioMinorista === undefined
            ? 0
            : Number(nuevoElectrodomestico.precioMinorista),
        precioMayorista:
          nuevoElectrodomestico.precioMayorista === "" || nuevoElectrodomestico.precioMayorista === undefined
            ? 0
            : Number(nuevoElectrodomestico.precioMayorista),
        cantidadMinimaMayorista:
          nuevoElectrodomestico.cantidadMinimaMayorista === "" ||
            nuevoElectrodomestico.cantidadMinimaMayorista === undefined
            ? 0
            : Number(nuevoElectrodomestico.cantidadMinimaMayorista),
        disponible: nuevoElectrodomestico.disponible ?? true,
      } as any

      await agregarElectrodomestico(payload)
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
      setDialogAbierto(false)
      alert("Producto agregado correctamente")
    } catch (err) {
      console.error(err)
      alert("Error al agregar producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditarElectrodomestico = async () => {
    if (editandoId === null) return
    try {
      setIsSubmitting(true)
      const payload = {
        ...nuevoElectrodomestico,
        precioMinorista:
          nuevoElectrodomestico.precioMinorista === "" || nuevoElectrodomestico.precioMinorista === undefined
            ? 0
            : Number(nuevoElectrodomestico.precioMinorista),
        precioMayorista:
          nuevoElectrodomestico.precioMayorista === "" || nuevoElectrodomestico.precioMayorista === undefined
            ? 0
            : Number(nuevoElectrodomestico.precioMayorista),
        cantidadMinimaMayorista:
          nuevoElectrodomestico.cantidadMinimaMayorista === "" ||
            nuevoElectrodomestico.cantidadMinimaMayorista === undefined
            ? 0
            : Number(nuevoElectrodomestico.cantidadMinimaMayorista),
        disponible: nuevoElectrodomestico.disponible ?? true,
      } as any

      await editarElectrodomestico(editandoId, payload)
      setEditandoId(null)
      setDialogAbierto(false)
      alert("Producto actualizado correctamente")
    } catch (err) {
      console.error("Error guardando cambios:", err)
      alert("No se pudo actualizar el producto: " + (err instanceof Error ? err.message : "error desconocido"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEliminarElectrodomestico = (id: number) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return
    eliminarElectrodomestico(id)
  }

  const handleToggleDisponibilidad = (id: number) => {
    toggleDisponibilidad(id)
  }

  // --- FIX: hacer logout async y esperar a que termine antes de push
  const handleLogout = async () => {
    try {
      // si logout retorna promesa, la esperamos; si es síncrona, también funciona
      await logout()
    } catch (err) {
      // ignoramos errores de logout y seguimos con redirect
      console.error("Logout error:", err)
    } finally {
      // hacer push después
      router.push("/")
    }
  }

  // helpers para paginación visual
  const gotoPrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const gotoNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))
  const changePageSize = (n: number) => {
    setPageSize(n)
    setCurrentPage(1)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Panel de Administración</h1>
            <p className="text-xs text-muted-foreground">Gestión de productos</p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-md bg-transparent hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* — filtro integrado (usa tu FiltersBar) — */}
        <div className="mb-4">
          <FiltersBar
            id="admin-search"
            value={busqueda}
            onChange={(v) => {
              setBusqueda(v)
              setCurrentPage(1)
            }}
            placeholder="Buscar por nombre, marca o categoría..."
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

        {/* --- Card contenedor con título, add button y tabla --- */}
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
                  setIsCustomCategory(false)
                  setDialogAbierto(true)
                }}
                className="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>

          {/* tabla (pasamos sólo items de la página actual) */}
          <ProductTable
            items={pageItems}
            admin={true}
            onEdit={(p) => iniciarEdicion(p)}
            onToggleDisponibilidad={(id) => handleToggleDisponibilidad(id)}
            onDelete={(id) => handleEliminarElectrodomestico(id)}
          />

          {/* paginación simple */}
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

        {/* mensaje cuando no hay resultados */}
        {productosFiltradosOrdenados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        )}

        {/* Dialog (agregar/editar) — FORMULARIO con categoria tipo 'bebes' y textarea auto-resize */}
        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogContent className="sm:max-w-[640px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editandoId ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {editandoId ? "Modifica los datos del electrodoméstico." : "Completa los datos para agregar un nuevo producto al catálogo."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <div className="grid gap-2">
                <Label htmlFor="nombre" className="text-gray-700">Nombre</Label>
                <Input id="nombre" value={nuevoElectrodomestico.nombre} onChange={(e) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, nombre: e.target.value })} placeholder="Ej: EcoWash Pro 8kg" className="border-gray-200" />
              </div>

              {/* Marca / Categoría (categoría con opción seleccionar o crear) */}
              <div className="grid gap-2 sm:grid-cols-1 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="marca" className="text-gray-700">Marca</Label>
                  <Input id="marca" value={nuevoElectrodomestico.marca} onChange={(e) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, marca: e.target.value })} placeholder="Ej: Samsung" className="border-gray-200" />
                </div>

                <div className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="categoria" className="text-gray-700">Categoría</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCustomCategory((s) => !s)
                        // si cambiamos a custom, limpiar el campo; si volvemos a select, dejar sin selección
                        setNuevoElectrodomestico({ ...nuevoElectrodomestico, categoria: "" })
                      }}
                      className="text-xs"
                    >
                      {isCustomCategory ? "Seleccionar existente" : "Crear nueva"}
                    </Button>
                  </div>

                  {isCustomCategory ? (
                    <Input
                      id="categoria"
                      value={nuevoElectrodomestico.categoria}
                      onChange={(e) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, categoria: e.target.value })}
                      placeholder="Escribe una nueva categoría"
                      className="border-gray-200"
                    />
                  ) : (
                    <Select
                      value={nuevoElectrodomestico.categoria ?? ""}
                      onValueChange={(value) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precioMinorista" className="text-gray-700">Precio Minorista ($)</Label>
                  <Input id="precioMinorista" type="text" inputMode="decimal" pattern="[0-9]*([.,][0-9]+)?" value={String(nuevoElectrodomestico.precioMinorista ?? "")} onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.,]/g, "")
                    const normalized = raw.replace(",", ".")
                    setNuevoElectrodomestico({ ...nuevoElectrodomestico, precioMinorista: normalized === "" ? "" : Number(normalized) } as any)
                  }} placeholder="599" className="border-gray-200" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioMayorista" className="text-gray-700">Precio Mayorista ($)</Label>
                  <Input id="precioMayorista" type="text" inputMode="decimal" pattern="[0-9]*([.,][0-9]+)?" value={String(nuevoElectrodomestico.precioMayorista ?? "")} onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.,]/g, "")
                    const normalized = raw.replace(",", ".")
                    setNuevoElectrodomestico({ ...nuevoElectrodomestico, precioMayorista: normalized === "" ? "" : Number(normalized) } as any)
                  }} placeholder="499" className="border-gray-200" />
                </div>
              </div>

              {/* Cant. min mayorista */}
              <div className="space-y-2">
                <Label htmlFor="cantidadMinimaMayorista" className="text-gray-700">Cantidad Mínima Mayorista</Label>
                <Input id="cantidadMinimaMayorista" type="text" inputMode="numeric" pattern="\d*" value={String(nuevoElectrodomestico.cantidadMinimaMayorista ?? "")} onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "")
                  setNuevoElectrodomestico({ ...nuevoElectrodomestico, cantidadMinimaMayorista: digits === "" ? "" : Number(digits) } as any)
                }} placeholder="5" className="border-gray-200" />
              </div>

              {/* Descripción: textarea auto-resize */}
              <div className="grid gap-2">
                <Label htmlFor="descripcion" className="text-gray-700">Descripción</Label>
                <Input id="descripcion" value={nuevoElectrodomestico.descripcion} onChange={(e) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, descripcion: e.target.value })} placeholder="Descripción detallada del producto" className="border-gray-200" />
              </div>

              {/* Imagen URL */}
              <div className="grid gap-2">
                <Label htmlFor="imagen" className="text-gray-700">URL de Imagen</Label>
                <Input id="imagen" value={nuevoElectrodomestico.imagen} onChange={(e) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, imagen: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg" className="border-gray-200" />
              </div>



              {/* Disponible */}
              <div className="flex items-center gap-3 mt-2">
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={!!nuevoElectrodomestico.disponible} onChange={(e) => setNuevoElectrodomestico({ ...nuevoElectrodomestico, disponible: e.target.checked })} className="form-checkbox h-4 w-4 text-gray-600" />
                  <span className="ml-2 text-gray-700">Disponible</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={editandoId ? handleEditarElectrodomestico : handleAgregarElectrodomestico}
                className="outline"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : editandoId ? "Guardar Cambios" : "Agregar Producto"}

              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
