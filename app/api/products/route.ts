// app/api/products/route.ts
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

const ALLOWED_COLUMNS = [
  "nombre",
  "marca",
  "categoria",
  "precioMinorista",
  "precioMayorista",
  "cantidadMinimaMayorista",
  "disponible",
  "descripcion",
  "imagenURL",
  "imagenURLs", // <--- añadido
] as const

type AllowedKey = (typeof ALLOWED_COLUMNS)[number]

function normalizeImagenURLsField(rawValue: any): string[] {
  if (Array.isArray(rawValue)) return rawValue.map((x) => String(x).trim()).filter(Boolean)
  if (typeof rawValue === "string") {
    // puede venir como JSON string '["a","b"]' o como una sola URL
    try {
      const parsed = JSON.parse(rawValue)
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean)
    } catch {
      // no es JSON: tratar como única URL
      return [rawValue.trim()].filter(Boolean)
    }
  }
  return []
}

function cleanAndMapPayload(raw: any) {
  const out: Record<string, any> = {}

  // Copiar solamente keys permitidas (si vienen)
  for (const key of ALLOWED_COLUMNS) {
    if (raw[key] !== undefined) {
      out[key] = raw[key]
    }
  }

  // Compatibilidad: si el cliente envía `imagen` en vez de `imagenURL`, mapearlo.
  if (out.imagenURL === undefined && raw.imagen !== undefined) {
    out.imagenURL = raw.imagen
  }

  // Normalizar imagenURLs:
  // prioridad: raw.imagenURLs (array o json-string) -> si no, si hay imagenURL/imagen crear array con ese valor
  const imagenURLsFromRaw = raw.imagenURLs !== undefined ? normalizeImagenURLsField(raw.imagenURLs) : []
  if (imagenURLsFromRaw.length > 0) {
    out.imagenURLs = imagenURLsFromRaw
  } else {
    // si no vino imagenURLs pero sí imagenURL o imagen, crear array con el primero
    const candidate = out.imagenURL ?? raw.imagenURL ?? raw.imagen
    if (candidate) out.imagenURLs = normalizeImagenURLsField(candidate)
  }

  // Asegurarnos imagenURL sea un string (preferir el primer elemento de imagenURLs si no se proporcionó)
  if (!out.imagenURL) {
    if (Array.isArray(out.imagenURLs) && out.imagenURLs.length > 0) {
      out.imagenURL = String(out.imagenURLs[0])
    } else {
      out.imagenURL = out.imagenURL ? String(out.imagenURL) : undefined
    }
  } else {
    out.imagenURL = String(out.imagenURL)
  }

  // Normalizar tipos simples
  if (out.precioMinorista !== undefined) out.precioMinorista = Number(out.precioMinorista) || 0
  if (out.precioMayorista !== undefined) out.precioMayorista = Number(out.precioMayorista) || 0
  if (out.cantidadMinimaMayorista !== undefined)
    out.cantidadMinimaMayorista = Number(out.cantidadMinimaMayorista) || 0
  if (out.disponible !== undefined) out.disponible = Boolean(out.disponible)

  return out
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("Producto").select("*")
    if (error) {
      console.error("Error getting products from Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ products: data })
  } catch (error) {
    console.error("Unexpected error getting products:", error)
    return NextResponse.json({ error: "Failed to get products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.debug("DEBUG - incoming body:", JSON.stringify(body))

    // Soportar: body es un producto, o { products: [...] }, o { product: {...} }
    let rawProduct: any
    if (body?.products && Array.isArray(body.products)) {
      rawProduct = body.products[0]
    } else if (body?.product) {
      rawProduct = body.product
    } else {
      rawProduct = body
    }

    if (!rawProduct || typeof rawProduct !== "object") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }

    // Limpiar y mapear
    const clean = cleanAndMapPayload(rawProduct)
    console.debug("DEBUG - insert payload (clean):", JSON.stringify(clean))

    // Validaciones mínimas
    if (!clean.nombre || clean.nombre.toString().trim() === "") {
      return NextResponse.json({ error: "Nombre es obligatorio" }, { status: 400 })
    }

    // Insertar en Supabase
    const { data, error } = await supabase.from("Producto").insert([clean]).select()
    console.debug("DEBUG - supabase data:", data, "error:", error)

    if (error) {
      console.error("Error saving product to Supabase:", error)
      return NextResponse.json({ error: error.message || "Supabase insert failed" }, { status: 500 })
    }

    const created = Array.isArray(data) ? data[0] : data

    return NextResponse.json({ success: true, product: created })
  } catch (error) {
    console.error("Unexpected error saving product:", error)
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const product = await request.json()

    if (!product.id) {
      return NextResponse.json({ error: "El ID del producto es obligatorio" }, { status: 400 })
    }

    // Limpiar antes de actualizar para no enviar columnas inexistentes
    const clean = cleanAndMapPayload(product)
    delete (clean as any).id

    const { data, error } = await supabase.from("Producto").update(clean).eq("id", product.id).select()
    if (error) {
      console.error("Error updating product in Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: Array.isArray(data) ? data[0] : data })
  } catch (error) {
    console.error("Unexpected error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "El ID del producto es obligatorio" }, { status: 400 })
    }

    const { data, error } = await supabase.from("Producto").delete().eq("id", id)
    if (error) {
      console.error("Error deleting product from Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  } catch (error) {
    console.error("Unexpected error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
