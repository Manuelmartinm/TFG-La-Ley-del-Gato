const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Usuario = require('../models/Usuario');

// ─── PRODUCTOS Y PRECIOS ──────────────────────────────────────────────────────
const PACKS_MONEDAS = [
  { id: 'pack_raton',   nombre: 'Pack Ratón',   monedas: 200,  precio: 199,  descripcion: '200 Monedas' },
  { id: 'pack_agente',  nombre: 'Pack Agente',  monedas: 550,  precio: 499,  descripcion: '550 Monedas' },
  { id: 'pack_elite',   nombre: 'Pack Élite',   monedas: 1200, precio: 999,  descripcion: '1200 Monedas' },
  { id: 'pack_leyenda', nombre: 'Pack Leyenda', monedas: 2500, precio: 1999, descripcion: '2500 Monedas' },
];

const PREMIUM = {
  id: 'premium',
  nombre: 'Acceso Premium',
  precio: 999,
  descripcion: 'Acceso permanente a la tienda premium'
};

// ─── CREAR SESIÓN DE PAGO ─────────────────────────────────────────────────────
router.post('/crear-sesion', async (req, res) => {
  try {
    const { tipo, pack_id, nombre_usuario } = req.body;

    if (!nombre_usuario) {
      return res.status(400).json({ error: 'nombre_usuario requerido' });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let lineItems = [];
    let metadata  = { nombre_usuario, tipo };

    if (tipo === 'monedas') {
      const pack = PACKS_MONEDAS.find(p => p.id === pack_id);
      if (!pack) return res.status(400).json({ error: 'Pack no válido' });

      metadata.pack_id = pack.id;
      metadata.monedas = pack.monedas;

      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: pack.nombre,
            description: pack.descripcion,
            images: ['https://tfg-la-ley-del-gato.onrender.com/Imagenes/FondoMain.png'],
          },
          unit_amount: pack.precio, // en céntimos
        },
        quantity: 1,
      }];

    } else if (tipo === 'premium') {
      // Verificar que no sea ya premium
      if (usuario.rol === 'PREMIUM') {
        return res.status(400).json({ error: 'Ya tienes acceso premium' });
      }

      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: PREMIUM.nombre,
            description: PREMIUM.descripcion,
            images: ['https://tfg-la-ley-del-gato.onrender.com/Imagenes/FondoMain.png'],
          },
          unit_amount: PREMIUM.precio,
        },
        quantity: 1,
      }];

    } else {
      return res.status(400).json({ error: 'Tipo de pago no válido' });
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      metadata,
      success_url: `${process.env.BASE_URL}/pago-exitoso.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.BASE_URL}/Tienda/tienda.html?cancelado=true`,
      locale: 'es',
    });

    res.status(200).json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Error creando sesión de pago:', error);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

// ─── VERIFICAR PAGO COMPLETADO ────────────────────────────────────────────────
// El frontend llama a esto después de volver de Stripe para confirmar el pago
router.post('/verificar', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id requerido' });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'El pago no se ha completado' });
    }

    const { nombre_usuario, tipo, monedas, pack_id } = session.metadata;

    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (tipo === 'monedas') {
      usuario.monedas = (usuario.monedas || 0) + parseInt(monedas);
      await usuario.save();

      return res.status(200).json({
        mensaje: `✅ ${monedas} monedas añadidas a tu cuenta`,
        monedas_totales: usuario.monedas,
        tipo: 'monedas',
        monedas_añadidas: parseInt(monedas)
      });

    } else if (tipo === 'premium') {
      if (usuario.rol !== 'PREMIUM') {
        usuario.rol = 'PREMIUM';
        await usuario.save();
      }

      return res.status(200).json({
        mensaje: '⭐ ¡Bienvenido al club Premium!',
        tipo: 'premium',
        rol: usuario.rol
      });
    }

  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ error: 'Error al verificar el pago' });
  }
});

// ─── OBTENER PRECIOS (para mostrar en la tienda) ──────────────────────────────
router.get('/precios', (req, res) => {
  res.status(200).json({
    packs: PACKS_MONEDAS,
    premium: PREMIUM
  });
});

module.exports = router;