// components/admin/admin-product-form.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
}

export default function AdminProductForm({
  initial = {},
  onSubmit,
  onCancel,
  bucketName = "Fotos Catalogo",
  maxFiles = 6,
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

      <div>
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="marca">Marca</Label>
        <Input id="marca" value={form.marca ?? ""} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="categoria">Categoría</Label>
        <Input id="categoria" value={form.categoria ?? ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="precioMinorista">Precio minorista</Label>
          <Input id="precioMinorista" type="number" value={String(form.precioMinorista ?? "")} onChange={(e) => setForm({ ...form, precioMinorista: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="precioMayorista">Precio mayorista</Label>
          <Input id="precioMayorista" type="number" value={String(form.precioMayorista ?? "")} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} />
        </div>
      </div>

      <div>
        <Label htmlFor="cantidadMinimaMayorista">Cantidad mínima mayorista</Label>
        <Input id="cantidadMinimaMayorista" type="number" value={String(form.cantidadMinimaMayorista ?? "")} onChange={(e) => setForm({ ...form, cantidadMinimaMayorista: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Input id="descripcion" value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      </div>

      <div>
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

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center">
          <input type="checkbox" checked={!!form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} className="form-checkbox" />
          <span className="ml-2">Disponible</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  )
}
