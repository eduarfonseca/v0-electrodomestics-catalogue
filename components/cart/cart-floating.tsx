"use client"

import { useState } from "react"
import { CartButton } from "./cart-button"
import { CartModal } from "./cart-modal"

export function CartFloating() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <CartButton onClick={() => setCartOpen(true)} />
      </div>
      <CartModal open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
