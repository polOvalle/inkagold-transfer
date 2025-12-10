# Sistema de Transferencias Inkagold

Sistema web para gestionar transferencias de dinero entre 5 ciudades con roles de Admin y Trabajadores.

## Estructura del Proyecto

```
inkagold-transfer/
├── config/
│   └── database.js          # Configuración de PostgreSQL
├── database/
│   └── schema.sql           # Schema SQL de la BD
├── routes/
│   └── auth.js              # Rutas de autenticación
├── index.js                 # Servidor principal
├── package.json             # Dependencias
├── .env                     # Variables de entorno
├── .gitignore               # Archivos a ignorar en Git
└── README.md                # Este archivo
```

## Instalación

1. **Clonar o entrar al proyecto:**
```bash
cd inkagold-transfer
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno (.env):**
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transferencias_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_clave_secreta_muy_larga_aqui_123456
```

4. **Crear BD PostgreSQL:**
```bash
psql -U postgres -c "CREATE DATABASE transferencias_db;"
psql -U postgres -d transferencias_db -f database/schema.sql
```

## Ejecutar el Servidor

```bash
npm start
```

El servidor correrá en `http://localhost:3000`

## Rutas Disponibles

### Autenticación
- `POST /api/auth/login` - Login de usuarios
- `POST /api/auth/registro` - Registro de nuevos usuarios

### Próximamente
- Admin Dashboard
- Dashboard Trabajador
- Crear Transferencias
- Ver Transferencias
- Solicitar Eliminación

## Tecnologías Usadas

- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT
- **Seguridad:** Helmet, CORS, bcrypt
- **Validación:** Joi
- **Hosting:** Railway

## Próximas Fases

1. Conectar BD PostgreSQL
2. CRUD completo de transferencias
3. Dashboard Admin
4. Dashboard Trabajador
5. Sistema de autorización
6. Frontend React

## Autor

Inkagold Transfer System v1.0
