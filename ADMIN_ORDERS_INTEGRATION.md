# 📋 Integración del Panel de Órdenes en Admin

## Opción 1: Agregar una pestaña en el panel de admin

Modifica `app/admin/page.tsx` para agregar un selector de vista:

```typescript
"use client"

import React, { useState } from "react"
// ... otros imports ...
import { OrdersList } from "@/components/admin/orders-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("productos")
  
  // ... resto del código existente ...

  return (
    <div className="min-h-screen bg-background">
      {/* Header igual que antes */}
      <header>
        {/* ... */}
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="space-y-4">
            {/* Todo el código de productos aquí */}
            {/* ... */}
          </TabsContent>

          <TabsContent value="ordenes">
            <OrdersList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
```

## Opción 2: Crear una página separada

Crea `app/admin/ordenes/page.tsx`:

```typescript
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { OrdersList } from "@/components/admin/orders-list"
import Link from "next/link"

export default function OrdenesPage() {
  const { isAuthenticated, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, loading, router])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Órdenes de Compra</h1>
            <p className="text-sm text-muted-foreground">Gestión de órdenes</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                ← Volver a Productos
              </Button>
            </Link>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <OrdersList />
      </main>
    </div>
  )
}
```

## Opción 3: Agregar link en el header del admin

En `app/admin/page.tsx`, modifica el header:

```typescript
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Panel de Administración</h1>
      <p className="text-2xs text-muted-foreground">Gestión de productos</p>
    </div>

    <div className="flex items-center gap-2">
      <Link href="/admin/ordenes">
        <Button variant="outline" size="sm">
          📋 Ver Órdenes
        </Button>
      </Link>
      <ThemeToggle />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleLogout}
        className="text-red-600"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  </div>
</header>
```

## Características del Panel de Órdenes

✅ **Listado de órdenes**
- Muestra todas las órdenes ordenadas por fecha
- Información del cliente
- Total de la orden
- Estado de la orden
- Indicador de WhatsApp enviado

✅ **Detalles de orden**
- Modal con información completa
- Listado de productos
- Datos del cliente
- Cálculo de totales

✅ **Acciones**
- Copiar teléfono al portapapeles
- Ver detalles completos
- Actualizar lista

✅ **Filtrado**
- Por estado (pendiente, confirmada, enviada, entregada, cancelada)
- Por fecha
- Por cliente

## Personalización

### Cambiar colores de estado
En `components/admin/orders-list.tsx`:

```typescript
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
```

### Agregar más columnas
Modifica el componente para mostrar más información:

```typescript
<div className="grid grid-cols-3 gap-4 mb-4 text-sm">
  {/* Agregar más divs aquí */}
</div>
```

### Exportar órdenes a CSV
Agrega un botón en el header:

```typescript
const exportarCSV = () => {
  const csv = ordenes.map(o => 
    `${o.id},${o.cliente_nombre},${o.cliente_telefono},${o.total},${o.estado}`
  ).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ordenes.csv'
  a.click()
}
```

## Próximas Mejoras

- [ ] Filtrado avanzado por fecha, estado, cliente
- [ ] Búsqueda por teléfono o nombre
- [ ] Exportar a CSV/PDF
- [ ] Cambiar estado de orden desde el panel
- [ ] Enviar recordatorio por WhatsApp
- [ ] Estadísticas de órdenes
- [ ] Gráficos de ventas
- [ ] Integración con pasarela de pago

## Troubleshooting

| Problema | Solución |
|----------|----------|
| No se cargan las órdenes | Verifica que la tabla exista en Supabase |
| Error de autenticación | Verifica que estés logueado en admin |
| No se ve el panel | Verifica que hayas agregado el import correcto |

¡Listo para usar! 🚀
