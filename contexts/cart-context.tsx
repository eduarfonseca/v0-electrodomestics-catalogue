"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  id: number
  nombre: string
  marca: string
  precioMinorista: number
  precioMayorista: number
  cantidadMinimaMayorista: number
  cantidad: number
  imagenURL?: string
  esMayorista: boolean
}

interface CartContextType {
  items: CartItem[]
  agregarAlCarrito: (producto: any, cantidad: number, esMayorista: boolean) => void
  eliminarDelCarrito: (productoId: number) => void
  actualizarCantidad: (productoId: number, cantidad: number) => void
  vaciarCarrito: () => void
  total: number
  cantidadItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito del localStorage
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito")
    if (carritoGuardado) {
      try {
        setItems(JSON.parse(carritoGuardado))
      } catch (error) {
        console.error("Error cargando carrito:", error)
      }
    }
  }, [])

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items))
  }, [items])

  const agregarAlCarrito = (producto: any, cantidad: number, esMayorista: boolean) => {
    setItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === producto.id && item.esMayorista === esMayorista)

      if (itemExistente) {
        return prevItems.map((item) =>
          item.id === producto.id && item.esMayorista === esMayorista
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }

      return [
        ...prevItems,
        {
          id: producto.id,
          nombre: producto.nombre,
          marca: producto.marca,
          precioMinorista: producto.precioMinorista,
          precioMayorista: producto.precioMayorista,
          cantidadMinimaMayorista: producto.cantidadMinimaMayorista,
          cantidad,
          imagenURL: producto.imagenURL,
          esMayorista,
        },
      ]
    })
  }

  const eliminarDelCarrito = (productoId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productoId))
  }

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === productoId ? { ...item, cantidad } : item))
    )
  }

  const vaciarCarrito = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => {
    const precio = item.esMayorista ? item.precioMayorista : item.precioMinorista
    return sum + precio * item.cantidad
  }, 0)

  const cantidadItems = items.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        total,
        cantidadItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
