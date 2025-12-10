const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Obtener todos los cajeros
router.get('/', async (req, res) => {
  try {
    const { data: cajeros, error } = await supabase
      .from('cajeros')
      .select('*, bases(nombre)')
      .eq('activo', true);

    if (error) {
      return res.status(500).json({ error: 'Error al obtener cajeros' });
    }

    const cajerosFormateados = cajeros.map(c => ({
      id: c.id,
      nombre: c.nombre,
      base_id: c.base_id,
      base_nombre: c.bases?.nombre || 'Desconocido',
      telefono: c.telefono
    }));

    res.json({ cajeros: cajerosFormateados });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
