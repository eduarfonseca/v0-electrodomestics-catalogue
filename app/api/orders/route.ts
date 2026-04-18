import { supabaseAdmin } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "34123456789"

interface OrderItem {
  id: number
  nombre: string
  marca: string
  cantidad: number
  precioMinorista: number
  precioMayorista: number
  esMayorista: boolean
}

interface OrderData {
  cliente: {
    nombre: string
    email: string
    telefono: string
    direccion: string
  }
  items: OrderItem[]
  total: number
}

function formatearMensajeWhatsApp(orden: OrderData, ordenId: string): string {
  const itemsText = orden.items
    .map(
      (item) =>
        `• ${item.nombre} (${item.marca})\n  Cantidad: ${item.cantidad} x $${item.esMayorista ? item.precioMayorista : item.precioMinorista} = $${(item.cantidad * (item.esMayorista ? item.precioMayorista : item.precioMinorista)).toFixed(2)}`
    )
    .join("\n")

  return `
🛒 *NUEVA ORDEN DE COMPRA* #${ordenId}

👤 *Cliente:* ${orden.cliente.nombre}
📧 *Email:* ${orden.cliente.email || "No proporcionado"}
📱 *Teléfono:* ${orden.cliente.telefono}
📍 *Dirección:* ${orden.cliente.direccion || "No proporcionada"}

📦 *Productos:*
${itemsText}

💰 *Total:* $${orden.total.toFixed(2)}

---
Fecha: ${new Date().toLocaleString("es-ES")}
  `.trim()
}

async function enviarPorWhatsApp(mensaje: string, telefono: string): Promise<boolean> {
  try {
    // Opción 1: Usar WhatsApp Business API (requiere configuración)
    // Por ahora, retornamos true y el mensaje se puede enviar manualmente
    // En producción, integrar con Twilio, MessageBird, o WhatsApp Business API

    console.log("Mensaje WhatsApp preparado para:", telefono)
    console.log("Contenido:", mensaje)

    // Simulamos envío exitoso
    return true
  } catch (error) {
    console.error("Error preparando mensaje WhatsApp:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderData = await request.json()

    // Validar datos
    if (!body.cliente.nombre || !body.cliente.telefono || !body.items.length) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      )
    }

    // Crear orden en Supabase
    const { data: orden, error: errorOrden } = await supabaseAdmin
      .from("Ordenes")
      .insert({
        cliente_nombre: body.cliente.nombre,
        cliente_email: body.cliente.email,
        cliente_telefono: body.cliente.telefono,
        cliente_direccion: body.cliente.direccion,
        total: body.total,
        estado: "pendiente",
        items: body.items,
        fecha_creacion: new Date().toISOString(),
      })
      .select()
      .single()

    if (errorOrden) {
      console.error("Error creando orden:", errorOrden)
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 }
      )
    }

    // Preparar y enviar mensaje WhatsApp
    const mensaje = formatearMensajeWhatsApp(body, orden.id)
    const whatsappEnviado = await enviarPorWhatsApp(mensaje, body.cliente.telefono)

    // Actualizar estado de la orden si WhatsApp se envió
    if (whatsappEnviado) {
      await supabaseAdmin
        .from("Ordenes")
        .update({ whatsapp_enviado: true })
        .eq("id", orden.id)
    }

    return NextResponse.json(
      {
        success: true,
        ordenId: orden.id,
        mensaje: "Orden creada exitosamente",
        whatsappEnviado,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error en POST /api/orders:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ordenId = searchParams.get("id")

    if (ordenId) {
      const { data, error } = await supabaseAdmin
        .from("Ordenes")
        .select("*")
        .eq("id", ordenId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: "Orden no encontrada" },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    }

    // Obtener todas las órdenes (solo para admin)
    const { data, error } = await supabaseAdmin
      .from("Ordenes")
      .select("*")
      .order("fecha_creacion", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener órdenes" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en GET /api/orders:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
