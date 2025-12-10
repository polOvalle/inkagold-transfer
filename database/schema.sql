-- Crear tabla de bases (ciudades)
CREATE TABLE bases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL UNIQUE,
  ubicacion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'trabajador')),
  base_id INTEGER REFERENCES bases(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de transferencias
CREATE TABLE transferencias (
  id SERIAL PRIMARY KEY,
  usuario_origen_id INTEGER NOT NULL REFERENCES usuarios(id),
  base_origen_id INTEGER NOT NULL REFERENCES bases(id),
  base_destino_id INTEGER REFERENCES bases(id),
  dni_beneficiario VARCHAR(20) NOT NULL,
  nombre_beneficiario VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('p2p', 'bancaria', 'local')),
  estado VARCHAR(50) NOT NULL DEFAULT 'creada' CHECK (estado IN ('creada', 'en_transito', 'entregada', 'completada')),
  referencia VARCHAR(255),
  comprobante VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de solicitudes de eliminación
CREATE TABLE solicitudes_eliminacion (
  id SERIAL PRIMARY KEY,
  transferencia_id INTEGER NOT NULL REFERENCES transferencias(id),
  usuario_solicitante_id INTEGER NOT NULL REFERENCES usuarios(id),
  motivo TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  codigo_autorizacion VARCHAR(6),
  admin_autorizador_id INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de auditoria
CREATE TABLE logs_auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  accion VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar queries
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_base_id ON usuarios(base_id);
CREATE INDEX idx_transferencias_usuario_origen ON transferencias(usuario_origen_id);
CREATE INDEX idx_transferencias_base_origen ON transferencias(base_origen_id);
CREATE INDEX idx_transferencias_created_at ON transferencias(created_at);
CREATE INDEX idx_logs_usuario_id ON logs_auditoria(usuario_id);
