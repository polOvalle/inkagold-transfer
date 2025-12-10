-- Eliminar tablas antiguas si existen
DROP TABLE IF EXISTS logs_auditoria CASCADE;
DROP TABLE IF EXISTS solicitudes_eliminacion CASCADE;
DROP TABLE IF EXISTS transferencias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS cajeros CASCADE;
DROP TABLE IF EXISTS bases CASCADE;

-- Crear tabla de bases (ciudades/puntos)
CREATE TABLE bases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL UNIQUE,
  ubicacion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de cajeros (personas que atienden)
CREATE TABLE cajeros (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  base_id INTEGER NOT NULL REFERENCES bases(id),
  telefono VARCHAR(20),
  firma_digital VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios (SIMPLIFICADA)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'trabajador')),
  base_id INTEGER REFERENCES bases(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de transferencias
CREATE TABLE transferencias (
  id SERIAL PRIMARY KEY,
  codigo_operacion VARCHAR(20) NOT NULL UNIQUE,
  fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  solicitante_nombre VARCHAR(255) NOT NULL,
  solicitante_telefono VARCHAR(20),

  beneficiario_nombre VARCHAR(255) NOT NULL,
  beneficiario_dni VARCHAR(20),

  base_origen_id INTEGER NOT NULL REFERENCES bases(id),
  base_destino_id INTEGER REFERENCES bases(id),
  destino_ciudad VARCHAR(100),

  monto DECIMAL(10, 2) NOT NULL,
  comision DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,

  cajero_id INTEGER NOT NULL REFERENCES cajeros(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),

  estado VARCHAR(50) NOT NULL DEFAULT 'creada' CHECK (estado IN ('creada', 'en_transito', 'entregada', 'completada')),

  referencia VARCHAR(255),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('p2p', 'bancaria', 'local')),

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
  cajero_id INTEGER REFERENCES cajeros(id),
  accion VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_usuarios_base_id ON usuarios(base_id);
CREATE INDEX idx_cajeros_base_id ON cajeros(base_id);
CREATE INDEX idx_transferencias_usuario_id ON transferencias(usuario_id);
CREATE INDEX idx_transferencias_cajero_id ON transferencias(cajero_id);
CREATE INDEX idx_transferencias_codigo_operacion ON transferencias(codigo_operacion);
CREATE INDEX idx_transferencias_fecha ON transferencias(fecha_hora);

-- Insertar bases
INSERT INTO bases (nombre, ciudad, ubicacion) VALUES
  ('Sucursal Cusco', 'Cusco', 'Av. Principal 123'),
  ('Sucursal Juliaca', 'Juliaca', 'Calle Central 456'),
  ('Sucursal Arequipa', 'Arequipa', 'Av. Libertadores 789'),
  ('Sucursal Lima', 'Lima', 'Av. Javier Prado 101'),
  ('Sucursal Tacna', 'Tacna', 'Av. Bolognesi 202');

-- Insertar cajeros
INSERT INTO cajeros (nombre, base_id, telefono, activo) VALUES
  ('EDITH HUAMÁN', 1, '999123456', true),
  ('Juan Pérez', 1, '999234567', true),
  ('María García', 2, '999345678', true),
  ('Carlos López', 2, '999456789', true),
  ('Ana Martínez', 3, '999567890', true),
  ('Roberto Silva', 4, '999678901', true),
  ('Claudia Ruiz', 5, '999789012', true);

-- Insertar usuarios de prueba
-- Admin (universal)
-- Contraseña: admin123 (será encriptada en la app)
INSERT INTO usuarios (usuario, password, rol, base_id, activo) VALUES
  ('admin', '$2b$10$YourHashedPasswordHere', 'admin', NULL, true);

-- Trabajadores por base
-- usuario_cusco / contraseña: 123456
-- usuario_juliaca / contraseña: 123456
-- usuario_arequipa / contraseña: 123456
-- usuario_lima / contraseña: 123456
-- usuario_tacna / contraseña: 123456
INSERT INTO usuarios (usuario, password, rol, base_id, activo) VALUES
  ('usuario_cusco', '$2b$10$YourHashedPasswordHere', 'trabajador', 1, true),
  ('usuario_juliaca', '$2b$10$YourHashedPasswordHere', 'trabajador', 2, true),
  ('usuario_arequipa', '$2b$10$YourHashedPasswordHere', 'trabajador', 3, true),
  ('usuario_lima', '$2b$10$YourHashedPasswordHere', 'trabajador', 4, true),
  ('usuario_tacna', '$2b$10$YourHashedPasswordHere', 'trabajador', 5, true);
