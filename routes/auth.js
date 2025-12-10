const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const router = express.Router();

// LOGIN - Solo usuario y contraseña
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Buscar usuario en Supabase
    const { data: usuarios, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario);

    if (errorBusqueda) {
      console.error('Error en BD:', errorBusqueda);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = usuarios[0];

    // Verificar si está activo
    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Obtener información de la base si es trabajador
    let baseInfo = null;
    if (user.rol === 'trabajador' && user.base_id) {
      const { data: base } = await supabase
        .from('bases')
        .select('*')
        .eq('id', user.base_id)
        .single();
      baseInfo = base;
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        rol: user.rol,
        base_id: user.base_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: user.id,
        usuario: user.usuario,
        rol: user.rol,
        base: baseInfo
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// REGISTRO - Crear nuevo usuario trabajador (solo admin puede)
router.post('/registro', async (req, res) => {
  try {
    const { usuario, password, base_id, token_admin } = req.body;

    // Verificar que sea admin
    if (!token_admin) {
      return res.status(401).json({ error: 'Se requiere autenticación de admin' });
    }

    const decoded = jwt.verify(token_admin, process.env.JWT_SECRET);
    if (decoded.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo admin puede crear usuarios' });
    }

    if (!usuario || !password || !base_id) {
      return res.status(400).json({ error: 'Usuario, contraseña y base_id requeridos' });
    }

    // Verificar si existe
    const { data: usuariosExistentes } = await supabase
      .from('usuarios')
      .select('id')
      .eq('usuario', usuario);

    if (usuariosExistentes && usuariosExistentes.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const { data: nuevoUsuario, error: errorInsert } = await supabase
      .from('usuarios')
      .insert([{
        usuario,
        password: passwordHash,
        rol: 'trabajador',
        base_id: parseInt(base_id),
        activo: true
      }])
      .select();

    if (errorInsert) {
      console.error('Error al insertar:', errorInsert);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }

    res.json({
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario[0].id,
        usuario: nuevoUsuario[0].usuario,
        rol: nuevoUsuario[0].rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
