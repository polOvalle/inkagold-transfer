const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar usuario en Supabase
    const { data: usuarios, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email);

    if (errorBusqueda) {
      return res.status(500).json({ error: 'Error en la BD' });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(password, usuario.password);

    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, base_id: usuario.base_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        base_id: usuario.base_id
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { email, password, nombre, rol, base_id } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Campos requeridos: email, password, nombre' });
    }

    // Verificar si existe
    const { data: usuariosExistentes } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email);

    if (usuariosExistentes && usuariosExistentes.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario en Supabase
    const { data: nuevoUsuario, error: errorInsert } = await supabase
      .from('usuarios')
      .insert([{
        email,
        password: passwordHash,
        nombre,
        rol: rol || 'trabajador',
        base_id: base_id || null
      }])
      .select();

    if (errorInsert) {
      console.error('Error al insertar:', errorInsert);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }

    const usuario = nuevoUsuario[0];

    res.json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
