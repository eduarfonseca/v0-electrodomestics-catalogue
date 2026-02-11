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
      if (!f.type.startsWith("image/")) return setError("Solo se permiten imágenes")
      if (f.size > maxMB * 1024 * 1024) return setError(`Cada imagen debe ser menor a ${maxMB}MB`)
    }
    setFiles((cur) => [...cur, ...selected])
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      // subir nuevos archivos primero
      const uploadResult = await uploadFilesToServer(files)
      const newUrls = uploadResult.map((r) => r.url).filter(Boolean)

      const combined = [...(form.imagenURLs ?? []), ...newUrls]

      const payload: NuevoElectrodomesticoState = {
        ...form,
        imagenURLs: combined,
        imagenURL: combined[0] ?? form.imagenURL,
        precioMinorista: form.precioMinorista === "" ? 0 : Number(form.precioMinorista ?? 0),
        precioMayorista: form.precioMayorista === "" ? 0 : Number(form.precioMayorista ?? 0),
        cantidadMinimaMayorista:
          form.cantidadMinimaMayorista === "" ? 0 : Number(form.cantidadMinimaMayorista ?? 0),
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
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        <Label htmlFor="nombre">Nombre</Label>
        <textarea id="nombre" value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive" />
      </div>

      <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        <Label htmlFor="marca">Marca</Label>
        <textarea id="marca" value={form.marca ?? ""} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive" />
      </div>

      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="categoria" className="">Categoría</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsCustomCategory((s) => !s)
              setForm({ ...form, categoria: "" })
            }}
            className="text-s text-white shadow-md dark:text-white dark:bg-accent"
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
            className="border-gray-200"
          />
        ) : (
          <Select value={form.categoria ?? ""} onValueChange={(value) => setForm({ ...form, categoria: value })}>
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

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
          <Label htmlFor="precioMinorista">Precio minorista</Label>
          <Input id="precioMinorista" type="number" value={String(form.precioMinorista ?? "")} onChange={(e) => setForm({ ...form, precioMinorista: e.target.value })} />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center">
            <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
              <Label htmlFor="precioMinorista">Disponibilidad</Label>
              <input type="checkbox" checked={!!form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} className="form-checkbox" />
              <span className="ml-2">Disponible</span>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
          <Label htmlFor="precioMayorista">Precio mayorista</Label>
          <Input id="precioMayorista" type="number" value={String(form.precioMayorista ?? "")} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} />
        </div>
        <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
          <Label htmlFor="cantidadMinimaMayorista">Cantidad mínima mayorista</Label>
          <Input id="cantidadMinimaMayorista" type="number" value={String(form.cantidadMinimaMayorista ?? "")} onChange={(e) => setForm({ ...form, cantidadMinimaMayorista: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        <Label htmlFor="descripcion">Descripción</Label>
        <textarea id="descripcion" value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive" />
      </div>

      <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        <Label htmlFor="imagenes">Imágenes (máx {maxFiles})</Label>
        <input id="imagenes" type="file" accept="image/*" multiple onChange={handleFilesChange} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div key={p + i} className="relative border rounded p-1">
              <img src={p} alt={`preview-${i}`} className="object-contain h-24 w-full rounded" />
              <button type="button" onClick={() => handleRemovePreview(i)} className="absolute top-1 right-1 bg-white/80 rounded px-1 text-xs">Eliminar</button>
            </div>
          ))}
        </div>
        {uploading && <div className="mt-2 text-sm">Subiendo imágenes...</div>}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  )
}
