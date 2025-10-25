// components/shared/page-size-filter.tsx
"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

type Props = {
  selected: number
  onChange: (n: number) => void
  options?: number[]
  labelSmall?: string // e.g. "Filas"
  searchId?: string
}

/**
 * PageSizeFilter — dropdown con diseño idéntico a Category/Brand filters.
 */
export default function PageSizeFilter({
  selected,
  onChange,
  options = [5, 10, 20],
  labelSmall = "Filas",
}: Props) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null)

  // posicionamiento portal cuando está abierto
  useLayoutEffect(() => {
    if (!open) return
    const compute = () => {
      const btn = buttonRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      setMenuStyle({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    compute()
    window.addEventListener("resize", compute)
    window.addEventListener("scroll", compute, true)
    return () => {
      window.removeEventListener("resize", compute)
      window.removeEventListener("scroll", compute, true)
    }
  }, [open])

  // cerrar al click fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const t = e.target as Node | null
      if (!t) return
      if (buttonRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside)
      document.addEventListener("touchstart", handleOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [open])

  // Escape para cerrar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const handleSelect = (n: number) => {
    onChange(n)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const portalMenu = (
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Seleccionar filas por página"
      className="rounded-lg shadow-lg bg-popover border border-gray-200 p-1 max-h-[60vh] overflow-auto"
      style={
        menuStyle
          ? {
              position: "absolute",
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
              zIndex: 99999,
              pointerEvents: "auto",
            }
          : { position: "absolute", visibility: "hidden", zIndex: 99999 }
      }
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => handleSelect(opt)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 ${
            selected === opt ? "bg-accent/20 font-medium shadow-md" : "hover:bg-muted/40 hover:shadow-md"
          }`}
        >
          {opt} filas
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col">
          <span className="text-sm text-muted-foreground">{labelSmall}</span>
        </div>

        <div className="flex items-center gap-1 bg-card/50 p-1 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform-gpu">
          <Button
            ref={buttonRef}
            variant="ghost"
            size="sm"
            onClick={() => setOpen((s) => !s)}
            className={`h-8 px-3 min-w-[90px] flex items-center justify-between text-sm ${open ? "scale-105 shadow-md" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="truncate">{selected} filas</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {open && typeof document !== "undefined" && createPortal(portalMenu, document.body)}
    </div>
  )
}
