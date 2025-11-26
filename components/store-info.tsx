"use client"

import React, { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Phone, MapPin, Map } from "lucide-react"
import { InstagramSVG, FacebookSVG, MailSVG, WhatsAppSVG } from "./ui/svgs"
import { FacebookIcon, GmailIcon, InstagramIcon } from "./icons"

export default function StoreInfo() {
  const phoneDisplay = "+53 55550301"
  const whatsappNumber = "55550301"
  const phoneDisplay2 = "+53 54499134"
  const whatsappNumber2 = "54499134"
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola Eduardo, quiero consultar sobre un producto del catálogo"
  )}`
  const whatsappLink2 = `https://wa.me/${whatsappNumber2}?text=${encodeURIComponent(
    "Hola María, quiero consultar sobre un producto del catálogo"
  )}`

  const telLink = `tel:${phoneDisplay.replace(/\s+/g, "")}`
  const telLink2 = `tel:${phoneDisplay2.replace(/\s+/g, "")}`

  const address = "Cerro, La Habana, Cuba"
  const lat = "23.119"
  const lng = "-82.369028"

  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | null>(null)

  useEffect(() => {
    try {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || ""
      const isiOS = /iPhone|iPad|iPod/.test(ua)
      const isAndroid = /Android/.test(ua)
      if (isiOS) setPlatform("ios")
      else if (isAndroid) setPlatform("android")
      else setPlatform("desktop")
    } catch {
      setPlatform("desktop")
    }
  }, [])

  const buildMapsLink = () => {
    const label = "Dulces Sueños"
    if (platform === "ios") {
      return `maps://?q=${encodeURIComponent(`${lat},${lng}`)}`
    }
    if (platform === "android") {
      return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  const openMaps = () => {
    const url = buildMapsLink()
    try {
      const a = document.createElement("a")
      a.href = url
      a.target = "_blank"
      a.rel = "noopener noreferrer"
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      window.location.href = url
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Copiado al portapapeles")
    } catch (e) {
      console.error("Clipboard error", e)
      alert("No se pudo copiar. Selecciona y copia manualmente.")
    }
  }

  // --- Developer credit UI (NO TOCAR datos) ---
  const devName = "Eduardo Enrique Fonseca Heredia"
  const devWhatsRaw = "5355550301"
  const devWhatsDisplay = "+53 55550301"
  const devWhatsLink = `https://wa.me/${devWhatsRaw}?text=${encodeURIComponent("Hola Eduardo, te contacto desde la web Catálogo de Electrodomésticos.")}`
  const instagramLink = "https://instagram.com/eduar_fh"
  const facebookLink = "https://www.facebook.com/eduardoenrique.fonsecaheredia?mibextid=wwXIfr&mibextid=wwXIfr"
  const mailLink = "mailto:fonsecaeduar136@gmail.com"

  // --- Popover portal state & refs ---
  const [showDevContact, setShowDevContact] = useState(false)
  const devButtonRef = useRef<HTMLButtonElement | null>(null)
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number } | null>(null)

  const calculateCoords = () => {
    const btn = devButtonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const scrollY = window.scrollY || window.pageYOffset
    const scrollX = window.scrollX || window.pageXOffset
    const top = rect.bottom + scrollY + 8
    const preferredLeft = rect.left + scrollX
    const menuWidth = 260
    let left = preferredLeft
    if (left + menuWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuWidth - 8)
    }
    setPopoverCoords({ top, left })
  }

  const toggleDevPopover = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setShowDevContact((prev) => {
      const next = !prev
      if (next) setTimeout(() => calculateCoords(), 0)
      return next
    })
  }

  // close on outside click, on Esc, recalc on scroll/resize
  useEffect(() => {
    if (!showDevContact) return

    const onOutsideClick = (ev: MouseEvent) => {
      const portalEl = document.getElementById("dev-contact-popover")
      if (!portalEl) {
        setShowDevContact(false)
        return
      }
      if (devButtonRef.current && devButtonRef.current.contains(ev.target as Node)) return
      if (!portalEl.contains(ev.target as Node)) {
        setShowDevContact(false)
      }
    }

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setShowDevContact(false)
    }

    const onScrollOrResize = () => calculateCoords()

    document.addEventListener("click", onOutsideClick)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      document.removeEventListener("click", onOutsideClick)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDevContact])

  // Popover portal markup (styled with theme variables)
  const devPortal = popoverCoords && showDevContact ? (
    <div
      id="dev-contact-popover"
      style={{
        position: "absolute",
        top: popoverCoords.top,
        left: popoverCoords.left,
        zIndex: 99999,
        minWidth: 200,
      }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="false"
    >
      <div
        className="inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm"
        style={{
          background: "var(--color-popover, var(--color-card, #fff))",
          color: "var(--color-popover-foreground, var(--color-foreground, #111))",
          border: "1px solid var(--color-border, rgba(0,0,0,0.06))",
          boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
        }}
      >
        <span className="inline-flex items-center justify-center w-6 h-6" aria-hidden>
          {WhatsAppSVG}
        </span>

        <a
          href={devWhatsLink}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring,rgba(34,197,94,0.3))] rounded"
        >
          {devWhatsDisplay}
        </a>
      </div>
    </div>
  ) : null

  return (
    <section className="container mx-auto px-1 py-4">
      <Card className="bg-card" aria-labelledby="storeinfo-heading">
        <CardHeader>
          <CardTitle id="storeinfo-heading" className="text-2xl md:text-3xl">Contáctanos</CardTitle>
          <CardDescription>Información rápida para comunicarte o visitarnos.</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Horario */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-3">

              <Clock className="h-7 w-7 text-[var(--color-sidebar-primary, #F49F51)]" />

              <div>
                <p className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))]">Horario</p>
                <p className="font-semibold text-[var(--color-foreground,#111)]">Lunes/Sábado: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-3">

              <Phone className="h-7 w-7 text-[var(--color-sidebar-primary, #95C7C3)]" />


              <div className="min-w-0">
                <p className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))]">Contacto</p>
                <p className="font-semibold text-[var(--color-foreground,#111)] truncate">Eduardo</p>
                <div className="mt-1 flex items-center gap-2">
                  <a
                    href={telLink}
                    className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))] underline"
                    aria-label={`Llamar a ${phoneDisplay}`}
                  >
                    {phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="min-w-0 ml-4">
                <p className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))]">Contacto</p>
                <p className="font-semibold text-[var(--color-foreground,#111)] truncate">María</p>
                <div className="mt-1 flex items-center gap-2">
                  <a
                    href={telLink2}
                    className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))] underline"
                    aria-label={`Llamar a ${phoneDisplay2}`}
                  >
                    {phoneDisplay2}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* <button
                type="button"
                aria-label="Contactar por WhatsApp"
                title="Contactar por WhatsApp"
                className={`hover:text-accent-foreground hover:bg-accent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`}
              >
                <a href={whatsappLink} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-4 w-4 md:h-3 md:w-3 ">{WhatsAppSVG}</span>
                  
                  <span className="font-medium md:inline-block ml-2">WhatsApp</span>
                </a>
              </button> */}
              <Button
                asChild
                variant="outline"
                className="hover:bg-accent hover:text-accent-foreground bg-[color:var(--color-primary)/0.06]  border border-[color:var(--color-border)] dark:border-[color:var(--color-sidebar-border)]"
                aria-label="Chatear por WhatsApp con Eduardo"
              >
                <a href={whatsappLink} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0">{WhatsAppSVG}</span>
                  <span className="font-medium text-[var(--color-foreground,#111)] ">WhatsApp</span>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="hover:text-accent-foreground hover:bg-accent bg-[color:var(--color-primary)/0.06] border border-[color:var(--color-border)] dark:border-[color:var(--color-sidebar-border)]"
                aria-label="Chatear por WhatsApp con María"
              >
                <a href={whatsappLink2} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0">{WhatsAppSVG}</span>
                  <span className="font-medium text-[var(--color-foreground,#111)]">WhatsApp</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Dirección + Mapa */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-3">

              <MapPin className="h-8 w-8 text-[var(--color-sidebar-primary,#F7CCAD)]" />


              <div>
                <p className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))]">Ubicación</p>
                <p className="font-semibold text-[var(--color-foreground,#111)]">{address}</p>
                {/* <p className="text-xs text-[var(--color-muted-foreground,rgba(0,0,0,0.6))] mt-1">Coordenadas: {lat}, {lng}</p> */}
              </div>
            </div>

            {/* <div className="flex gap-2">
              <Button
                onClick={openMaps}
                variant="outline"
                className="hover:bg-accent flex-1 inline-flex items-center justify-center gap-2"
                aria-label="Abrir en la app de mapas"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0 hover:text-accent-foreground">
                  <Map className="w-4 h-4"/>
                </span>


                <span className="font-medium ">
                  Abrir en {platform === null ? "Maps" : platform === "ios" ? "Apple Maps" : platform === "android" ? "Google Maps" : "Maps"}
                </span>
              </Button>
            </div> */}
          </div>

          {/* Footer / Créditos */}
          <div className="col-span-full mt-6 pt-4 ">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))]">Desarrollado por</div>

                <button
                  ref={devButtonRef}
                  onClick={toggleDevPopover}
                  aria-expanded={showDevContact}
                  aria-controls="dev-contact-popover"
                  className="font-medium text-[var(--color-foreground,#111)] hover:text-[var(--color-foreground,#111)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring,rgba(34,197,94,0.2))] rounded"
                  title="Contactar al desarrollador"
                >
                  {devName}
                </button>

                {typeof document !== "undefined" && devPortal ? createPortal(devPortal, document.body) : null}
              </div>

              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))] hover:text-[var(--color-foreground,#111)] transition-colors"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md"

                    aria-hidden
                  >
                    <InstagramIcon />
                  </span>
                  <span className="hidden sm:inline">Instagram</span>
                </a>

                {/* Facebook */}
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))] hover:text-[var(--color-foreground,#111)] transition-colors"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md"

                    aria-hidden
                  >
                    <FacebookIcon />
                  </span>
                  <span className="hidden sm:inline">Facebook</span>
                </a>

                {/* Email */}
                <a
                  href={mailLink}
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground,rgba(0,0,0,0.6))] hover:text-[var(--color-foreground,#111)] transition-colors"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md"

                    aria-hidden
                  >
                    <GmailIcon />
                  </span>
                  <span className="hidden sm:inline">fonsecaeduar136@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="mt-3 text-xs text-[var(--color-muted-foreground,rgba(0,0,0,0.6))]">
              © {new Date().getFullYear()} Catálogo de Electrodomésticos. Todos los derechos reservados.
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
