"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"

interface CartButtonProps {
  onClick: () => void
}

export function CartButton({ onClick }: CartButtonProps) {
  const { cantidadItems } = useCart()

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {cantidadItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cantidadItems}
        </span>
      )}
    </Button>
  )
}
