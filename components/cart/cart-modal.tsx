"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface CartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartModal({ open, onOpenChange }: CartModalProps) {
  const { items, eliminarDelCarrito, actualizarCantidad, total, vaciarCarrito } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async () => {
    if (!formData.nombre || !formData.telefono) {
      toast.error("Por favor completa nombre y teléfono")
      return
    }

    if (items.length === 0) {
      toast.error("El carrito está vacío")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: formData,
          items,
          total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la orden")
      }

      toast.success("Orden creada. Mensaje enviado a WhatsApp")
      vaciarCarrito()
      onOpenChange(false)
      setFormData({ nombre: "", email: "", telefono: "", direccion: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar la orden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carrito de Compras</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            El carrito está vacío
          </div>
        ) : (
          <div className="space-y-6">
            {/* Items */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.id}-${item.esMayorista}`} className="flex gap-4 border-b pb-4">
                  {item.imagenURL && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.imagenURL}
                        alt={item.nombre}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{item.marca}</p>
                    <p className="text-sm mt-1">
                      ${item.esMayorista ? item.precioMayorista : item.precioMinorista}
                      {item.esMayorista && " (Mayorista)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarDelCarrito(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-700">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Datos de Contacto</h3>
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono (WhatsApp) *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+34 123 456 789"
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Tu dirección"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Continuar Comprando
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Procesando..." : "Enviar Orden por WhatsApp"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
