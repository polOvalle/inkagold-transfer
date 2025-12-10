require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const { verificarToken } = require('./middleware/auth');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas públicas
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor de Transferencias Inkagold funcionando!',
    version: '1.0.0',
    endpoints: {
      login: 'POST /api/auth/login',
      registro: 'POST /api/auth/registro'
    }
  });
});

app.use('/api/auth', authRoutes);

// Ruta de prueba (requiere autenticación)
app.get('/api/protegida', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Acceso autorizado',
    usuario: req.usuario
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Accede a http://localhost:${PORT}`);
  console.log(`🔌 Conectado a Supabase`);
});
