const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Asegúrate de que esta ruta a tu modelo sea correcta

const PRECIOS_PACKS = {
  'pack_raton':   200,
  'pack_agente':  550,
  'pack_elite':   1200,
  'pack_leyenda': 2500
};

// 1. Crear sesión simulada
router.post('/crear-sesion', async (req, res) => {
  const { tipo, pack_id, nombre_usuario, item_id } = req.body;
  
  // Generamos una URL que mande al usuario a tu carpeta de cliente con los datos
  let url = `/client/pago/pago.html?tipo=${tipo}&user=${nombre_usuario}`;
  if (pack_id) url += `&pack=${pack_id}`;
  if (item_id) url += `&item=${item_id}`;

  res.json({ url });
});

// 2. Verificar y actualizar DB
router.post('/verificar', async (req, res) => {
  const { tipo, pack_id, nombre_usuario } = req.body;
  
  try {
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    if (tipo === 'monedas') {
      const cantidad = PRECIOS_PACKS[pack_id] || 0;
      usuario.monedas = (usuario.monedas || 0) + cantidad;
      await usuario.save();
      return res.json({ 
        tipo: 'monedas', 
        monedas_totales: usuario.monedas, 
        monedas_añadidas: cantidad, 
        mensaje: "TRANSFERENCIA DE CRÉDITOS COMPLETADA" 
      });
    }

    if (tipo === 'premium') {
      usuario.rol = 'PREMIUM';
      await usuario.save();
      return res.json({ tipo: 'premium', mensaje: "ACCESO AL CLUB DE ÉLITE ACTIVADO" });
    }

    res.json({ mensaje: "PROCESADO" });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;