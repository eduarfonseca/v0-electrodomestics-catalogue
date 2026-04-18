# 🛒 Carrito de Compras - Quick Start

## ✅ Lo que se implementó

### 1. **Contexto del Carrito** (`contexts/cart-context.tsx`)
- Gestión global del estado del carrito
- Persistencia en localStorage
- Soporte para minorista y mayorista

### 2. **Componentes del Carrito**
- `CartButton` - Botón flotante con contador
- `CartModal` - Modal con items y checkout
- `AddToCartClient` - Selector de cantidad y tipo de compra
- `CartFloating` - Componente flotante integrado

### 3. **API de Órdenes** (`app/api/orders/route.ts`)
- POST: Crear nueva orden
- GET: Obtener órdenes (con filtro por ID)
- Integración con Supabase
- Preparación de mensajes WhatsApp

### 4. **Base de Datos**
- Tabla `Ordenes` con todos los campos
- Tabla `Ordenes_Auditoria` para auditoría
- Índices para optimizar búsquedas

### 5. **Panel de Admin** (`components/admin/orders-list.tsx`)
- Listado de todas las órdenes
- Vista detallada de cada orden
- Copiar teléfono al portapapeles
- Filtrado por estado

## 🚀 Pasos para Activar

### Paso 1: Crear la tabla en Supabase
```sql
-- Copia el contenido de lib/supabase-migrations.sql
-- Pégalo en el SQL Editor de Supabase y ejecuta
```

### Paso 2: Agregar variable de entorno (opcional)
```env
# En .env.local
NEXT_PUBLIC_WHATSAPP_PHONE=34123456789
```

### Paso 3: Usar en la página de producto
✅ Ya está integrado en `app/producto/[id]/page.tsx`

### Paso 4: Ver órdenes en admin
```typescript
// En app/admin/page.tsx, agrega:
import { OrdersList } from "@/components/admin/orders-list"

export default function AdminPage() {
  return (
    <div>
      <OrdersList />
    </div>
  )
}
```

## 📱 Flujo de Usuario

1. Usuario ve un producto
2. Selecciona cantidad y tipo (minorista/mayorista)
3. Hace clic en "Agregar al Carrito"
4. Carrito flotante aparece en esquina inferior derecha
5. Usuario hace clic en el carrito
6. Modal se abre con items
7. Completa formulario (nombre, teléfono, etc.)
8. Hace clic en "Enviar Orden por WhatsApp"
9. Orden se guarda en BD
10. Mensaje se prepara para WhatsApp

## 🎯 Características

✅ Carrito flotante siempre visible
✅ Persistencia en localStorage
✅ Soporte minorista/mayorista
✅ Validación de cantidad mínima
✅ Cálculo automático de totales
✅ Formulario de checkout
✅ Integración con Supabase
✅ Preparación de mensajes WhatsApp
✅ Panel de admin para ver órdenes
✅ Auditoría de cambios

## 🔧 Personalización Rápida

### Cambiar color del botón
`components/cart/add-to-cart-client.tsx` línea ~80:
```typescript
className="w-full bg-green-600 hover:bg-green-700"
// Cambiar a:
className="w-full bg-blue-600 hover:bg-blue-700"
```

### Cambiar posición del carrito
`components/cart/cart-floating.tsx` línea ~10:
```typescript
<div className="fixed bottom-6 right-6 z-40">
// Cambiar a:
<div className="fixed bottom-6 left-6 z-40">
```

### Personalizar mensaje WhatsApp
`app/api/orders/route.ts` función `formatearMensajeWhatsApp`

## 📊 Estructura de Datos

### En localStorage
```javascript
// carrito
[
  {
    id: 1,
    nombre: "Refrigerador",
    cantidad: 2,
    esMayorista: false,
    precioMinorista: 500,
    ...
  }
]
```

### En Supabase
```sql
SELECT * FROM "Ordenes";
-- Devuelve todas las órdenes con cliente, items, total, estado, etc.
```

## 🧪 Testing

1. Abre la página de un producto
2. Selecciona cantidad y tipo
3. Haz clic en "Agregar al Carrito"
4. Verifica que aparezca el carrito flotante
5. Abre el carrito
6. Completa el formulario
7. Haz clic en "Enviar Orden por WhatsApp"
8. Verifica en Supabase que se creó la orden

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Carrito no persiste | Verifica localStorage en DevTools |
| Órdenes no se guardan | Verifica que la tabla exista en Supabase |
| Error al crear orden | Revisa los logs en la consola |
| WhatsApp no se envía | Verifica variables de entorno |

## 📚 Archivos Creados

```
contexts/
├── cart-context.tsx

components/cart/
├── cart-button.tsx
├── cart-modal.tsx
├── cart-floating.tsx
├── add-to-cart-client.tsx

components/admin/
├── orders-list.tsx

app/api/orders/
├── route.ts

lib/
├── supabase-migrations.sql

Documentación:
├── CARRITO_SETUP.md (guía completa)
├── CARRITO_QUICK_START.md (este archivo)
```

## 🎨 Próximas Mejoras

- [ ] Integración con Twilio para envío automático de WhatsApp
- [ ] Confirmación por email
- [ ] Historial de órdenes del cliente
- [ ] Descuentos y códigos promocionales
- [ ] Pasarela de pago (Stripe, PayPal)
- [ ] Notificaciones en tiempo real

## 💡 Tips

- El carrito se guarda automáticamente en localStorage
- Las órdenes se guardan en Supabase
- El mensaje WhatsApp se formatea automáticamente
- Puedes personalizar todo desde los componentes
- El panel de admin es completamente funcional

¡Listo para usar! 🚀
