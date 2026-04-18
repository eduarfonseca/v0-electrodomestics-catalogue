# 📱 Integración con WhatsApp - Guía Completa

## Estado Actual

Actualmente, el sistema **prepara el mensaje** pero no lo envía automáticamente. Esto es intencional para que puedas elegir tu proveedor de WhatsApp.

## Opciones de Integración

### Opción 1: Twilio (Recomendado - Más Fácil)

#### Paso 1: Crear cuenta en Twilio
1. Ve a [twilio.com](https://www.twilio.com)
2. Crea una cuenta gratuita
3. Obtén tu `Account SID` y `Auth Token`
4. Configura WhatsApp Sandbox

#### Paso 2: Instalar Twilio
```bash
npm install twilio
```

#### Paso 3: Agregar variables de entorno
```env
# .env.local
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

#### Paso 4: Actualizar la API
Reemplaza la función `enviarPorWhatsApp` en `app/api/orders/route.ts`:

```typescript
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

async function enviarPorWhatsApp(mensaje: string, telefono: string): Promise<boolean> {
  try {
    // Asegúrate de que el teléfono tenga formato internacional
    const telefonoFormato = telefono.startsWith('+') ? telefono : `+${telefono}`
    
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${telefonoFormato}`,
      body: mensaje,
    })
    
    console.log(`Mensaje WhatsApp enviado a ${telefonoFormato}`)
    return true
  } catch (error) {
    console.error("Error enviando WhatsApp con Twilio:", error)
    return false
  }
}
```

### Opción 2: MessageBird

#### Paso 1: Crear cuenta
1. Ve a [messagebird.com](https://www.messagebird.com)
2. Crea una cuenta
3. Obtén tu API Key

#### Paso 2: Instalar MessageBird
```bash
npm install messagebird
```

#### Paso 3: Agregar variables de entorno
```env
MESSAGEBIRD_API_KEY=your_api_key_here
MESSAGEBIRD_WHATSAPP_CHANNEL_ID=your_channel_id
```

#### Paso 4: Actualizar la API
```typescript
import MessageBird from 'messagebird'

const messageBird = new MessageBird(process.env.MESSAGEBIRD_API_KEY)

async function enviarPorWhatsApp(mensaje: string, telefono: string): Promise<boolean> {
  try {
    const telefonoFormato = telefono.startsWith('+') ? telefono : `+${telefono}`
    
    await messageBird.messageCreate(
      process.env.MESSAGEBIRD_WHATSAPP_CHANNEL_ID,
      telefonoFormato,
      mensaje
    )
    
    return true
  } catch (error) {
    console.error("Error enviando WhatsApp con MessageBird:", error)
    return false
  }
}
```

### Opción 3: WhatsApp Business API (Oficial)

#### Ventajas
- Oficial de Meta
- Mejor soporte
- Más características

#### Desventajas
- Requiere aprobación
- Más complejo de configurar
- Costo más alto

#### Paso 1: Solicitar acceso
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una app
3. Solicita acceso a WhatsApp Business API
4. Espera aprobación (puede tomar días)

#### Paso 2: Configurar
```env
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_BUSINESS_PHONE_ID=your_phone_id
WHATSAPP_BUSINESS_API_TOKEN=your_api_token
```

#### Paso 3: Implementar
```typescript
async function enviarPorWhatsApp(mensaje: string, telefono: string): Promise<boolean> {
  try {
    const telefonoFormato = telefono.replace(/\D/g, '')
    
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_BUSINESS_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: telefonoFormato,
          type: 'text',
          text: { body: mensaje },
        }),
      }
    )
    
    return response.ok
  } catch (error) {
    console.error("Error enviando WhatsApp Business:", error)
    return false
  }
}
```

### Opción 4: Envío Manual (Sin Integración)

Si no quieres integración automática, puedes:

1. Guardar el mensaje en la BD
2. Mostrar un link de WhatsApp al usuario
3. Copiar el mensaje al portapapeles

```typescript
// Generar link de WhatsApp
const generarLinkWhatsApp = (telefono: string, mensaje: string) => {
  const telefonoFormato = telefono.replace(/\D/g, '')
  const mensajeEncodificado = encodeURIComponent(mensaje)
  return `https://wa.me/${telefonoFormato}?text=${mensajeEncodificado}`
}

// En el componente
<a 
  href={generarLinkWhatsApp(orden.cliente_telefono, mensaje)}
  target="_blank"
  rel="noopener noreferrer"
  className="btn btn-green"
>
  Enviar por WhatsApp
</a>
```

## Formato del Mensaje

El sistema genera automáticamente un mensaje profesional:

```
🛒 *NUEVA ORDEN DE COMPRA* #123

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

### Personalizar el Mensaje

Edita la función `formatearMensajeWhatsApp` en `app/api/orders/route.ts`:

```typescript
function formatearMensajeWhatsApp(orden: OrderData, ordenId: string): string {
  const itemsText = orden.items
    .map(
      (item) =>
        `• ${item.nombre} (${item.marca})\n  Cantidad: ${item.cantidad} x $${item.esMayorista ? item.precioMayorista : item.precioMinorista}`
    )
    .join("\n")

  return `
🛒 *NUEVA ORDEN* #${ordenId}

Cliente: ${orden.cliente.nombre}
Teléfono: ${orden.cliente.telefono}

Productos:
${itemsText}

Total: $${orden.total.toFixed(2)}
  `.trim()
}
```

## Testing

### Test Local con Twilio
```bash
# 1. Instala Twilio CLI
npm install -g twilio-cli

# 2. Configura tu cuenta
twilio login

# 3. Prueba el envío
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": {
      "nombre": "Test User",
      "email": "test@example.com",
      "telefono": "+34123456789",
      "direccion": "Test Address"
    },
    "items": [{
      "id": 1,
      "nombre": "Producto Test",
      "marca": "Test",
      "cantidad": 1,
      "precioMinorista": 100,
      "precioMayorista": 80,
      "esMayorista": false
    }],
    "total": 100
  }'
```

### Verificar en Supabase
```sql
SELECT * FROM "Ordenes" 
WHERE whatsapp_enviado = true 
ORDER BY fecha_creacion DESC 
LIMIT 10;
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Module not found: twilio" | Ejecuta `npm install twilio` |
| "Invalid phone number" | Verifica formato: debe ser +34123456789 |
| "Unauthorized" | Verifica que las variables de entorno sean correctas |
| "Message not sent" | Revisa los logs en la consola del servidor |
| "Sandbox not activated" | En Twilio, activa el WhatsApp Sandbox |

## Costos Estimados

| Proveedor | Costo | Notas |
|-----------|-------|-------|
| Twilio | $0.0075 por mensaje | Prueba gratis con sandbox |
| MessageBird | $0.01 por mensaje | Prueba gratis |
| WhatsApp Business | Variable | Requiere aprobación |

## Recomendación

Para empezar, usa **Twilio** porque:
- ✅ Fácil de configurar
- ✅ Sandbox gratuito para testing
- ✅ Buena documentación
- ✅ Precios competitivos
- ✅ Soporte confiable

## Próximas Mejoras

- [ ] Confirmación de entrega
- [ ] Notificaciones de estado
- [ ] Recordatorios automáticos
- [ ] Encuestas de satisfacción
- [ ] Soporte multiidioma
- [ ] Plantillas de mensajes personalizadas

¡Listo para integrar! 🚀
