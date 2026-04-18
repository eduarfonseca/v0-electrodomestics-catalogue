"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, Copy, CheckCircle, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"

interface Orden {
  id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  cliente_direccion: string
  total: number
  estado: string
  items: any[]
  whatsapp_enviado: boolean
  fecha_creacion: string
}

export function OrdersList() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null)

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrdenes(data)
    } catch (error) {
      toast.error("Error cargando órdenes")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      confirmada: "bg-blue-100 text-blue-800",
      enviada: "bg-purple-100 text-purple-800",
      entregada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    }
    return variants[estado] || "bg-gray-100 text-gray-800"
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "entregada":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelada":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto)
    toast.success("Copiado al portapapeles")
  }

  if (loading) {
    return <div className="text-center py-8">Cargando órdenes...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Órdenes de Compra</h2>
        <Button onClick={cargarOrdenes} variant="outline">
          Actualizar
        </Button>
      </div>

      {ordenes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay órdenes aún
        </div>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <Card key={orden.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Orden #{orden.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(orden.fecha_creacion).toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getEstadoBadge(orden.estado)}>
                    {getEstadoIcon(orden.estado)}
                    <span className="ml-1">{orden.estado}</span>
                  </Badge>
                  {orden.whatsapp_enviado && (
                    <Badge variant="outline" className="bg-green-50">
                      ✓ WhatsApp
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{orden.cliente_nombre}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Teléfono</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{orden.cliente_telefono}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copiarAlPortapapeles(orden.cliente_telefono)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {orden.cliente_email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{orden.cliente_email}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold text-green-700">${orden.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Productos ({orden.items.length})</p>
                <div className="space-y-1 text-sm">
                  {orden.items.map((item, idx) => (
                    <p key={idx} className="text-muted-foreground">
                      • {item.nombre} - {item.cantidad}x ${item.esMayorista ? item.precioMayorista : item.precioMinorista}
                    </p>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(orden)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Orden #{selectedOrder.id}</h2>
              <Button
                variant="ghost"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedOrder.cliente_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-semibold">{selectedOrder.cliente_telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedOrder.cliente_email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-semibold">{selectedOrder.cliente_direccion || "N/A"}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        <p className="font-semibold">{item.nombre}</p>
                        <p className="text-muted-foreground">{item.marca}</p>
                      </div>
                      <div className="text-right">
                        <p>{item.cantidad}x ${item.esMayorista ? item.precioMayorista : item.precioMinorista}</p>
                        <p className="text-muted-foreground">
                          ${(item.cantidad * (item.esMayorista ? item.precioMayorista : item.precioMinorista)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-2xl text-green-700">${selectedOrder.total.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Fecha: {new Date(selectedOrder.fecha_creacion).toLocaleString("es-ES")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estado: <Badge className={getEstadoBadge(selectedOrder.estado)}>{selectedOrder.estado}</Badge>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
