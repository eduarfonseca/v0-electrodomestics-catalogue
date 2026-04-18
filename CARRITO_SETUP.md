# 🛒 Sistema de Carrito y Órdenes - Guía de Configuración

## 📋 Descripción General

Se ha implementado un sistema completo de carrito de compras con:
- ✅ Carrito flotante en la esquina inferior derecha
- ✅ Soporte para compras minoristas y mayoristas
- ✅ Modal de checkout con formulario de cliente
- ✅ Integración con base de datos (Supabase)
- ✅ Envío de órdenes por WhatsApp
- ✅ Persistencia en localStorage

## 🚀 Pasos de Configuración

### 1. Crear la tabla de Órdenes en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el SQL Editor
3. Copia y ejecuta el contenido de `lib/supabase-migrations.sql`

Esto creará:
- Tabla `Ordenes` con todos los campos necesarios
- Tabla `Ordenes_Auditoria` para auditoría (opcional)
- Índices para optimizar búsquedas

### 2. Configurar Variables de Entorno

Agrega a tu `.env.local`:

```env
# WhatsApp (número de teléfono del negocio)
NEXT_PUBLIC_WHATSAPP_PHONE=34123456789

# Opcional: Para integración con WhatsApp Business API
WHATSAPP_API_KEY=tu_api_key_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_account_id_aqui
```

### 3. Integración con WhatsApp (Opcional pero Recomendado)

Actualmente, el sistema prepara el mensaje pero no lo envía automáticamente. Para envío automático:

#### Opción A: Twilio (Recomendado)
```bash
npm install twilio
```

Actualiza `app/api/orders/route.ts`:
```typescript
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

async function enviarPorWhatsApp(mensaje: string, telefono: string): Promise<boolean> {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${telefono}`,
      body: mensaje,
    })
    return true
  } catch (error) {
    console.error("Error enviando WhatsApp:", error)
    return false
  }
}
```

#### Opción B: MessageBird
```bash
npm install messagebird
```

#### Opción C: WhatsApp Business API (Oficial)
Requiere aprobación de Meta. Consulta la documentación oficial.

### 4. Agregar Variables de Entorno para Twilio

```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=+34123456789
```

## 📁 Estructura de Archivos Creados

```
contexts/
├── cart-context.tsx          # Contexto global del carrito

components/cart/
├── cart-button.tsx           # Botón flotante del carrito
├── cart-modal.tsx            # Modal con items y checkout
├── cart-floating.tsx         # Componente flotante
├── add-to-cart-client.tsx    # Selector de cantidad y tipo

app/api/
└── orders/
    └── route.ts              # API para crear órdenes

lib/
└── supabase-migrations.sql   # Script SQL para BD
```

## 🎯 Características Principales

### Carrito
- **Persistencia**: Los items se guardan en localStorage
- **Tipos de compra**: Minorista y Mayorista con precios diferentes
- **Cantidad mínima**: Validación automática para mayorista
- **Cálculo de totales**: Automático según cantidad y tipo

### Checkout
- **Formulario**: Nombre, email, teléfono, dirección
- **Validación**: Campos requeridos (nombre y teléfono)
- **Mensaje WhatsApp**: Formateado profesionalmente con detalles de la orden

### Base de Datos
- **Tabla Ordenes**: Almacena todas las órdenes
- **Campos**: Cliente, items, total, estado, fecha
- **Auditoría**: Registro de cambios (opcional)

## 🔧 Uso en Componentes

### Agregar al Carrito
```typescript
import { useCart } from "@/contexts/cart-context"

export function MiComponente() {
  const { agregarAlCarrito } = useCart()
  
  const handleAgregar = () => {
    agregarAlCarrito(producto, cantidad, esMayorista)
  }
}
```

### Acceder al Carrito
```typescript
const { items, total, cantidadItems, vaciarCarrito } = useCart()
```

## 📊 Estructura de Datos

### CartItem
```typescript
{
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
```

### Orden (en BD)
```typescript
{
  id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  cliente_direccion: string
  total: number
  estado: 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada'
  items: CartItem[]
  whatsapp_enviado: boolean
  fecha_creacion: timestamp
}
```

## 🎨 Personalización

### Cambiar Colores
Edita `components/cart/add-to-cart-client.tsx`:
```typescript
// Cambiar color del botón
className="w-full bg-green-600 hover:bg-green-700"
// Por:
className="w-full bg-blue-600 hover:bg-blue-700"
```

### Cambiar Posición del Carrito
Edita `components/cart/cart-floating.tsx`:
```typescript
// Cambiar de bottom-6 right-6 a otra posición
<div className="fixed bottom-6 right-6 z-40">
```

### Personalizar Mensaje WhatsApp
Edita la función `formatearMensajeWhatsApp` en `app/api/orders/route.ts`

## 🧪 Testing

### Probar Localmente
1. Agrega un producto al carrito
2. Abre el modal del carrito
3. Completa el formulario
4. Haz clic en "Enviar Orden por WhatsApp"
5. Verifica que la orden se cree en Supabase

### Verificar en Supabase
```sql
SELECT * FROM "Ordenes" ORDER BY fecha_creacion DESC LIMIT 10;
```

## 🐛 Troubleshooting

### El carrito no persiste
- Verifica que localStorage esté habilitado
- Abre DevTools → Application → Local Storage

### Las órdenes no se guardan
- Verifica que la tabla `Ordenes` exista en Supabase
- Comprueba los permisos de la tabla (RLS policies)
- Revisa los logs en la consola del navegador

### WhatsApp no se envía
- Verifica que tengas configuradas las variables de entorno
- Comprueba que el número de teléfono sea válido
- Revisa los logs del servidor

## 📱 Ejemplo de Mensaje WhatsApp

```
🛒 *NUEVA ORDEN DE COMPRA* #1

👤 *Cliente:* Juan Pérez
📧 *Email:* juan@example.com
📱 *Teléfono:* +34 123 456 789
📍 *Dirección:* Calle Principal 123

📦 *Productos:*
• Refrigerador Samsung (Samsung)
  Cantidad: 2 x $500 = $1000
• Lavadora LG (LG)
  Cantidad: 1 x $800 = $800

💰 *Total:* $1800

---
Fecha: 19/3/2026 14:30:45
```

## 🚀 Próximas Mejoras

- [ ] Integración con pasarela de pago (Stripe, PayPal)
- [ ] Confirmación de órdenes por email
- [ ] Panel de admin para gestionar órdenes
- [ ] Historial de órdenes del cliente
- [ ] Descuentos y códigos promocionales
- [ ] Carrito compartible por link
- [ ] Notificaciones en tiempo real

## 📞 Soporte

Para problemas o preguntas, revisa:
1. Los logs del navegador (F12 → Console)
2. Los logs del servidor (terminal)
3. La tabla de auditoría en Supabase
