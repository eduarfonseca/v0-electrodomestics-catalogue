-- Crear tabla de Órdenes
CREATE TABLE IF NOT EXISTS "Ordenes" (
  id BIGSERIAL PRIMARY KEY,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20) NOT NULL,
  cliente_direccion TEXT,
  total DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmada, enviada, entregada, cancelada
  items JSONB NOT NULL, -- Array de items del carrito
  whatsapp_enviado BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_telefono ON "Ordenes"(cliente_telefono);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON "Ordenes"(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_creacion ON "Ordenes"(fecha_creacion DESC);

-- Crear tabla de auditoría de órdenes (opcional)
CREATE TABLE IF NOT EXISTS "Ordenes_Auditoria" (
  id BIGSERIAL PRIMARY KEY,
  orden_id BIGINT REFERENCES "Ordenes"(id) ON DELETE CASCADE,
  accion VARCHAR(50), -- creada, actualizada, cancelada
  cambios JSONB,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para auditoría
CREATE INDEX IF NOT EXISTS idx_ordenes_auditoria_orden_id ON "Ordenes_Auditoria"(orden_id);
