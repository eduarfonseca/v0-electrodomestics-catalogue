// components/admin/admin-product-form.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// <-- exportamos el tipo para que lo puedas reusar en admin/page.tsx
export type NuevoElectrodomesticoState = {
  nombre?: string
  marca?: string
  categoria?: string
  precio?: number | string
  precioMinorista?: number | string
  precioMayorista?: number | string
  cantidadMinimaMayorista?: number | string
  // mantenemos ambos: imagenURL (compatibilidad) e imagenURLs (array)
  imagenURL?: string
  imagenURLs?: string[]
  descripcion?: string
  disponible?: boolean
}

type Props = {
  initial?: Partial<NuevoElectrodomesticoState>
  onSubmit: (payload: NuevoElectrodomesticoState) => Promise<void>
  onCancel?: () => void
  bucketName?: string
  maxFiles?: number
  existingCategories?: string[]
}

export default function AdminProductForm({
  initial = {},
  onSubmit,
  onCancel,
  bucketName = "Fotos Catalogo",
  maxFiles = 6,
  existingCategories = [],
}: Props) {
  const [form, setForm] = useState<NuevoElectrodomesticoState>({
    nombre: initial.nombre ?? "",
    marca: initial.marca ?? "",
    categoria: initial.categoria ?? "",
    precio: initial.precio ?? 0,
    precioMinorista: initial.precioMinorista ?? 0,
    precioMayorista: initial.precioMayorista ?? 0,
    cantidadMinimaMayorista: initial.cantidadMinimaMayorista ?? 0,
    // inicializamos imagenURLs tomando imagenURLs si existe; si no, usamos imagenURL si hay
    imagenURLs: initial.imagenURLs ?? (initial.imagenURL ? [initial.imagenURL] : []),
    imagenURL: initial.imagenURL ?? (initial.imagenURLs && initial.imagenURLs[0]) ?? undefined,
    descripcion: initial.descripcion ?? "",
    disponible: initial.disponible ?? true,
  })

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>(form.imagenURLs ?? [])
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  useEffect(() => {
    // generar previews locales para los archivos seleccionados
    const localUrls = files.map((f) => URL.createObjectURL(f))
    setPreviews([...(form.imagenURLs ?? []), ...localUrls])
    return () => localUrls.forEach((u) => URL.revokeObjectURL(u))
  }, [files, form.imagenURLs])

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return
    if (selected.length + (form.imagenURLs?.length ?? 0) > maxFiles) {
      setError(`Máximo ${maxFiles} imágenes por producto`)
      return
    }
    const maxMB = 5
    for (const f of selected) {
      if (!f.type.startsWith("image/")) {
        setError("Solo se permiten imágenes")
        return
      }
      if (f.size > maxMB * 1024 * 1024) {
        setError(`Cada imagen debe ser menor a ${maxMB}MB`)
        return
      }
    }
    setFiles((cur) => [...cur, ...selected])
    e.currentTarget.value = ""
  }

  async function uploadFilesToServer(filesToUpload: File[]) {
    if (filesToUpload.length === 0) return [] as { path: string; url: string }[]
    setUploading(true)
    try {
      const uploaded: { path: string; url: string }[] = []
      for (const file of filesToUpload) {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("bucket", bucketName)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(`Upload failed: ${txt}`)
        }
        const json = await res.json()
        uploaded.push({ path: json.path, url: json.url })
      }
      return uploaded
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePreview = (index: number) => {
    const existingCount = form.imagenURLs?.length ?? 0
    if (index < existingCount) {
      const newArr = [...(form.imagenURLs ?? [])]
      newArr.splice(index, 1)
      setForm({ ...form, imagenURLs: newArr })
      return
    }
    const fileIndex = index - existingCount
    if (fileIndex >= 0 && fileIndex < files.length) {
      const newFiles = [...files]
      newFiles.splice(fileIndex, 1)
      setFiles(newFiles)
    }
  }

  // --- Helpers para inputs numéricos en tiempo real ---
  function allowDecimalKey(e: React.KeyboardEvent<HTMLInputElement>) {
    // allow digits, one decimal separator ('.' or ','), navigation keys, backspace, delete, tab, enter
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
      "Home",
      "End",
    ]
    if (allowed.includes(e.key)) return
    // allow ctrl/cmd combos (copy/paste/select)
    if (e.ctrlKey || e.metaKey) return
    const isDigit = /^[0-9]$/.test(e.key)
    const isSeparator = e.key === "." || e.key === ","
    if (isDigit) return
    if (isSeparator) {
      // if input already contains '.' or ',' do not allow another separator
      const val = (e.target as HTMLInputElement).value
      if (val.includes(".") || val.includes(",")) {
        e.preventDefault()
        return
      }
      return
    }
    e.preventDefault()
  }

  function allowIntegerKey(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
      "Home",
      "End",
    ]
    if (allowed.includes(e.key)) return
    if (e.ctrlKey || e.metaKey) return
    const isDigit = /^[0-9]$/.test(e.key)
    if (!isDigit) e.preventDefault()
  }

  function sanitizeDecimalInput(val: string) {
    // keep digits and at most one separator (either '.' or ',')
    let sanitized = val.replace(/[^0-9.,]/g, "")
    // if there are multiple separators, keep the first and remove the rest
    const firstSepIndex = Math.max(sanitized.indexOf("."), sanitized.indexOf(","))
    if (firstSepIndex !== -1) {
      const before = sanitized.slice(0, firstSepIndex + 1)
      const after = sanitized.slice(firstSepIndex + 1).replace(/[.,]/g, "")
      sanitized = before + after
    }
    return sanitized
  }

  function sanitizeIntegerInput(val: string) {
    return val.replace(/\D/g, "")
  }

  // --- Fin helpers ---

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      // subir nuevos archivos primero
      const uploadResult = await uploadFilesToServer(files)
      const newUrls = uploadResult.map((r) => r.url).filter(Boolean)

      const combined = [...(form.imagenURLs ?? []), ...newUrls]

      // Normalizar decimales: reemplazar coma por punto antes de convertir
      const minoristaNumber =
        String(form.precioMinorista ?? "")
          .trim()
          .replace(",", ".") === ""
          ? 0
          : Number(String(form.precioMinorista ?? "").replace(",", "."))
      const mayoristaNumber =
        String(form.precioMayorista ?? "")
          .trim()
          .replace(",", ".") === ""
          ? 0
          : Number(String(form.precioMayorista ?? "").replace(",", "."))
      const cantidadMinimaNumber =
        String(form.cantidadMinimaMayorista ?? "").trim() === ""
          ? 0
          : Number(String(form.cantidadMinimaMayorista ?? "").replace(/\D/g, ""))

      const payload: NuevoElectrodomesticoState = {
        ...form,
        imagenURLs: combined,
        imagenURL: combined[0] ?? form.imagenURL,
        precioMinorista: isNaN(minoristaNumber) ? 0 : minoristaNumber,
        precioMayorista: isNaN(mayoristaNumber) ? 0 : mayoristaNumber,
        cantidadMinimaMayorista: isNaN(cantidadMinimaNumber) ? 0 : cantidadMinimaNumber,
        disponible: !!form.disponible,
      }

      await onSubmit(payload)
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? "Error al guardar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      {/* Nombre */}
      <div className="mb-4">
        <Label htmlFor="nombre">Nombre</Label>
        <textarea
          id="nombre"
          rows={2}
          value={form.nombre ?? ""}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="mt-1 w-full min-h-[44px] rounded-md border bg-white dark:bg-input px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2"
          placeholder="Ej: Lavadora Automática 7.5 kg"
        />
      </div>

      {/* Marca */}
      <div className="mb-4">
        <Label htmlFor="marca">Marca</Label>
        <textarea
          id="marca"
          rows={1}
          value={form.marca ?? ""}
          onChange={(e) => setForm({ ...form, marca: e.target.value })}
          className="mt-1 w-full min-h-[44px] rounded-md border bg-white dark:bg-input px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2"
          placeholder="Ej: Milexus"
        />
      </div>

      {/* Categoría + botón alternar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsCustomCategory((s) => !s)
              setForm({ ...form, categoria: "" })
            }}
            className="h-8 min-h-8 text-sm"
          >
            {isCustomCategory ? "Seleccionar existente" : "Crear nueva"}
          </Button>
        </div>

        {isCustomCategory ? (
          <Input
            id="categoria"
            value={form.categoria ?? ""}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            placeholder="Escribe una nueva categoría"
            className="w-full"
          />
        ) : (
          <Select
            value={form.categoria ?? ""}
            onValueChange={(value) => setForm({ ...form, categoria: value })}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {existingCategories.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">No hay categorías</div>
              ) : (
                existingCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Precios / disponibilidad SECTION - ahora con flex que mantiene inputs lado a lado y los reduce si hace falta */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="precioMinorista">Precio minorista</Label>
          <input
            id="precioMinorista"
            // usamos text + inputMode para controlar teclado en móviles
            type="text"
            inputMode="decimal"
            value={String(form.precioMinorista ?? "")}
            onKeyDown={allowDecimalKey}
            onPaste={(ev) => {
              ev.preventDefault()
              const pasted = (ev.clipboardData || (window as any).clipboardData).getData("text")
              const clean = sanitizeDecimalInput(pasted)
              setForm((cur) => ({ ...cur, precioMinorista: clean }))
            }}
            onChange={(e) => {
              const cleaned = sanitizeDecimalInput(e.target.value)
              setForm((cur) => ({ ...cur, precioMinorista: cleaned }))
            }}
            className="mt-1 h-12 w-full rounded-md border px-3 py-2 text-base"
            placeholder="0"
            aria-label="Precio minorista"
          />
        </div>

        <div className="flex-1 min-w-[120px]">
          <Label htmlFor="precioMayorista">Precio mayorista</Label>
          <input
            id="precioMayorista"
            type="text"
            inputMode="decimal"
            value={String(form.precioMayorista ?? "")}
            onKeyDown={allowDecimalKey}
            onPaste={(ev) => {
              ev.preventDefault()
              const pasted = (ev.clipboardData || (window as any).clipboardData).getData("text")
              const clean = sanitizeDecimalInput(pasted)
              setForm((cur) => ({ ...cur, precioMayorista: clean }))
            }}
            onChange={(e) => {
              const cleaned = sanitizeDecimalInput(e.target.value)
              setForm((cur) => ({ ...cur, precioMayorista: cleaned }))
            }}
            className="mt-1 h-12 w-full rounded-md border px-3 py-2 text-base"
            placeholder="0"
            aria-label="Precio mayorista"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="cantidadMinimaMayorista">Cantidad mínima mayorista</Label>
          <input
            id="cantidadMinimaMayorista"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(form.cantidadMinimaMayorista ?? "")}
            onKeyDown={allowIntegerKey}
            onPaste={(ev) => {
              ev.preventDefault()
              const pasted = (ev.clipboardData || (window as any).clipboardData).getData("text")
              const clean = sanitizeIntegerInput(pasted)
              setForm((cur) => ({ ...cur, cantidadMinimaMayorista: clean }))
            }}
            onChange={(e) => {
              const cleaned = sanitizeIntegerInput(e.target.value)
              setForm((cur) => ({ ...cur, cantidadMinimaMayorista: cleaned }))
            }}
            className="mt-1 h-12 w-full rounded-md border px-3 py-2 text-base"
            placeholder="0"
            aria-label="Cantidad mínima mayorista"
          />
        </div>

        <div className="min-w-[120px] flex items-end">
          <div>
            <Label className="block">Disponibilidad</Label>
            <div className="mt-1 flex items-center">
              <input
                id="disponible"
                type="checkbox"
                checked={!!form.disponible}
                onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                className="h-5 w-5 rounded"
              />
              <label htmlFor="disponible" className="ml-2 text-sm select-none">
                Disponible
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-4">
        <Label htmlFor="descripcion">Descripción</Label>
        <textarea
          id="descripcion"
          rows={3}
          value={form.descripcion ?? ""}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="mt-1 w-full min-h-[72px] rounded-md border bg-white dark:bg-input px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2"
          placeholder="Descripción breve del producto..."
        />
      </div>

      {/* Imágenes */}
      <div className="mb-4">
        <Label>Imágenes (máx {maxFiles})</Label>

        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label
            htmlFor="imagenes"
            className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
            role="button"
          >
            Seleccionar imágenes
            <span className="ml-2 text-xs text-muted-foreground">(.jpg, .png)</span>
          </label>

          <div className="text-sm text-muted-foreground">
            {form.imagenURLs?.length ?? 0} guardadas · {files.length} nuevas
          </div>

          <input
            id="imagenes"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="sr-only"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {previews.map((p, i) => (
            <div
              key={p + i}
              className="relative rounded overflow-hidden border bg-white flex items-center justify-center"
              style={{ minHeight: 64 }}
            >
              <img src={p} alt={`preview-${i}`} className="object-cover w-full h-20" />
              <button
                type="button"
                onClick={() => handleRemovePreview(i)}
                className="absolute top-1 right-1 bg-white/90 rounded px-1 text-xs"
                aria-label={`Eliminar imagen ${i + 1}`}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {uploading && <div className="mt-2 text-sm">Subiendo imágenes...</div>}
      </div>

      {/* Acciones */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  )
}
