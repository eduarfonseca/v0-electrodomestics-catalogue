"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { toast } from "sonner"

interface AddToCartProps {
  producto: any
  onCartOpen: () => void
}

export function AddToCart({ producto, onCartOpen }: AddToCartProps) {
  const { agregarAlCarrito } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [esMayorista, setEsMayorista] = useState(false)

  const precioActual = esMayorista ? producto.precioMayorista : producto.precioMinorista
  const cantidadMinima = esMayorista ? producto.cantidadMinimaMayorista : 1

  const handleAgregar = () => {
    if (cantidad < cantidadMinima) {
      toast.error(`Cantidad mínima: ${cantidadMinima}`)
      return
    }

    agregarAlCarrito(producto, cantidad, esMayorista)
    toast.success(`${producto.nombre} agregado al carrito`)
    setCantidad(1)
    onCartOpen()
  }

  return (
    <div className="space-y-4 border-t pt-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Tipo de Compra</Label>
        <div className="flex gap-4">
          <button
            onClick={() => setEsMayorista(false)}
            className={`flex-1 py-2 px-4 rounded border-2 transition ${
              !esMayorista
                ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                : "border-gray-200 text-gray-600"
            }`}
          >
            Minorista
          </button>
          <button
            onClick={() => setEsMayorista(true)}
            className={`flex-1 py-2 px-4 rounded border-2 transition ${
              esMayorista
                ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                : "border-gray-200 text-gray-600"
            }`}
          >
            Mayorista
          </button>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">
          Cantidad {esMayorista && `(mínimo ${cantidadMinima})`}
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCantidad(Math.max(cantidadMinima, cantidad - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min={cantidadMinima}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(cantidadMinima, parseInt(e.target.value) || cantidadMinima))}
            className="w-20 text-center"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCantidad(cantidad + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Precio unitario</div>
        <div className="text-2xl font-bold text-green-700">${precioActual}</div>
        <div className="text-sm text-muted-foreground mt-2">
          Subtotal: <span className="font-semibold text-gray-900">${(precioActual * cantidad).toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handleAgregar}
        disabled={!producto.disponible}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {producto.disponible ? "Agregar al Carrito" : "Producto Agotado"}
      </Button>
    </div>
  )
}
