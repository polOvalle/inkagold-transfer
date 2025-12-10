const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Temporal - en la próxima fase conectaremos BD
const usuarios = [];

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar usuario (temporal)
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(password, usuario.password);

    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Campos requeridos' });
    }

    // Verificar si existe (temporal)
    if (usuarios.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      id: Date.now(),
      email,
      password: passwordHash,
      nombre,
      rol: rol || 'trabajador'
    };

    usuarios.push(nuevoUsuario);

    res.json({
      mensaje: 'Usuario registrado',
      usuario: { id: nuevoUsuario.id, email: nuevoUsuario.email, nombre: nuevoUsuario.nombre }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
