// components/back-button.tsx
"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter()

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault()
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back()
      } else {
        router.push(fallbackHref)
      }
    } catch (err) {
      // fallback si algo falla
      router.push(fallbackHref)
    }
  }

  return (
    <Button
      variant="outline"
      className="mb-6 hover:bg-[color:var(--muted)/0.12] focus:outline-none focus:ring-2 focus:ring-offset-1 border border-[color:var(--border)] dark:border-[color:var(--sidebar-border)]"
      onClick={handleBack}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Volver al Catálogo
    </Button>
  )
}
