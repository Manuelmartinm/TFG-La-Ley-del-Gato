const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// No necesitamos la librería de stripe, así que no dará error en Render
const PACKS_MONEDAS = [
  { id: 'pack_raton',   nombre: 'Pack Ratón',   monedas: 200,  precio: 199,  descripcion: '200 Monedas' },
  { id: 'pack_agente',  nombre: 'Pack Agente',  monedas: 550,  precio: 499,  descripcion: '550 Monedas' },
  { id: 'pack_elite',   nombre: 'Pack Élite',   monedas: 1200, precio: 999,  descripcion: '1200 Monedas' },
  { id: 'pack_leyenda', nombre: 'Pack Leyenda', monedas: 2500, precio: 1999, descripcion: '2500 Monedas' },
];

// ─── CREAR SESIÓN DE PAGO (SIMULADA) ──────────────────────────────────────────
router.post('/crear-sesion', async (req, res) => {
  try {
    const { tipo, pack_id, nombre_usuario } = req.body;
    
    // En lugar de ir a Stripe, generamos una URL de éxito propia
    // Pasamos los datos por la URL para que el siguiente paso sepa qué se compró
    const fakeSessionId = `SIM_${Date.now()}_${nombre_usuario}`;
    
    // Construimos la URL de éxito apuntando a tu página de pago-exitoso
    // Añadimos los datos necesarios como parámetros
    let redirectUrl = `/pago-exitoso.html?session_id=${fakeSessionId}&tipo=${tipo}&user=${nombre_usuario}`;
    if (pack_id) redirectUrl += `&pack=${pack_id}`;

    // Simulamos un pequeño retraso de red para que parezca real
    setTimeout(() => {
        res.status(200).json({ url: redirectUrl, session_id: fakeSessionId });
    }, 500);

  } catch (error) {
    res.status(500).json({ error: 'Error al simular el pago' });
  }
});

// ─── VERIFICAR PAGO COMPLETADO (SIMULADO) ─────────────────────────────────────
router.post('/verificar', async (req, res) => {
  try {
    const { session_id } = req.body;
    
    // Usamos los parámetros de la URL que nos envía el frontend (ver paso 2)
    const urlParams = new URLSearchParams(session_id.split('?')[1] || ""); 
    // Si no viene en el ID, lo sacamos de la lógica de simulación
    const params = req.body; // El HTML actualizado enviará todo el objeto

    const usuario = await Usuario.findOne({ nombre_usuario: params.nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (params.tipo === 'monedas') {
      const pack = PACKS_MONEDAS.find(p => p.id === params.pack_id);
      const cantidad = pack ? pack.monedas : 0;
      
      usuario.monedas = (usuario.monedas || 0) + cantidad;
      await usuario.save();

      return res.status(200).json({
        mensaje: `✅ ${cantidad} monedas añadidas a tu cuenta`,
        monedas_totales: usuario.monedas,
        tipo: 'monedas',
        monedas_añadidas: cantidad
      });

    } else if (params.tipo === 'premium') {
      usuario.rol = 'PREMIUM';
      await usuario.save();

      return res.status(200).json({
        mensaje: '⭐ ¡Bienvenido al club Premium!',
        tipo: 'premium',
        rol: usuario.rol
      });
    }

  } catch (error) {
    res.status(500).json({ error: 'Error al verificar la simulación' });
  }
});

module.exports = router;