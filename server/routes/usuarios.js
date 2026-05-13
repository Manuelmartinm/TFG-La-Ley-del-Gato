const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

// ─── REGISTRO ────────────────────────────────────────────────────────────────
router.post('/registro', async (req, res) => {
  try {
    const { nombre_usuario, email, contrasena, avatar } = req.body;

    const usuarioExiste = await Usuario.findOne({
      $or: [{ email }, { nombre_usuario }]
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: 'El nombre de usuario o el email ya están registrados' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash_contrasena = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = new Usuario({
      nombre_usuario,
      email,
      hash_contrasena,
      avatar: avatar || 0,
      email_verificado: true
    });

    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario creado con éxito. Ya puedes iniciar sesión.' });

  } catch (error) {
    console.error('ERROR EN REGISTRO:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identificador, contrasena } = req.body;

    const usuario = await Usuario.findOne({
      $or: [{ nombre_usuario: identificador }, { email: identificador }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Credenciales no válidas' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales no válidas' });
    }

    // Actualizar último acceso
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    res.status(200).json({
      mensaje: 'Acceso concedido',
      usuario: {
        id: usuario._id,
        nombre_usuario: usuario.nombre_usuario,
        avatar: usuario.avatar,
        email: usuario.email,
        email_verificado: usuario.email_verificado,
        fecha_creacion: usuario.fecha_creacion,
        monedas: usuario.monedas,
        puntuacion_total: usuario.puntuacion_total,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ─── ACTUALIZAR PERFIL ────────────────────────────────────────────────────────
router.put('/actualizar', async (req, res) => {
  try {
    const { nombre_usuario, avatar, nueva_contrasena } = req.body;

    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (avatar !== undefined) {
      usuario.avatar = avatar;
    }

    if (nueva_contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.hash_contrasena = await bcrypt.hash(nueva_contrasena, salt);
    }

    await usuario.save();

    res.status(200).json({ mensaje: 'Perfil actualizado con éxito' });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error en el servidor al actualizar' });
  }
});

// ─── OBTENER INVENTARIO ───────────────────────────────────────────────────────
router.get('/inventario/:nombre_usuario', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ nombre_usuario: req.params.nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({ inventario: usuario.inventario });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar inventario' });
  }
});

// ─── GUARDAR INVENTARIO ───────────────────────────────────────────────────────
router.put('/inventario/guardar', async (req, res) => {
  try {
    const { nombre_usuario, items } = req.body;
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuario.inventario = items;
    await usuario.save();

    res.status(200).json({ mensaje: 'Inventario sincronizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar inventario' });
  }
});

// ─── RANKING ──────────────────────────────────────────────────────────────────
router.get('/ranking', async (req, res) => {
  try {
    const topUsuarios = await Usuario.find()
      .sort({ puntuacion_total: -1 })
      .limit(10)
      .select('nombre_usuario avatar puntuacion_total');

    res.status(200).json({ ranking: topUsuarios });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ranking' });
  }
});

// ─── RECUPERAR CONTRASEÑA (PROXIMAMENTE) ─────────────────────────────────────
router.post('/recuperar', async (req, res) => {
  // Por ahora devolvemos OK para que el frontend no muestre error
  // TODO: implementar envío real de email con nodemailer/resend
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const usuario = await Usuario.findOne({ email });
    // Por seguridad, siempre respondemos OK aunque el email no exista
    res.status(200).json({ mensaje: 'Si el email está registrado, recibirás un enlace de recuperación.' });

  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ─── RESTABLECER CONTRASEÑA (PROXIMAMENTE) ───────────────────────────────────
router.post('/restablecer-contrasena', async (req, res) => {
  // TODO: implementar validación de token real
  res.status(400).json({ error: 'Función no disponible aún. Contacta con el administrador.' });
});

// ─── REINICIAR PROGRESO ───────────────────────────────────────────────────────
router.delete('/progreso', async (req, res) => {
  try {
    const { nombre_usuario } = req.body;
    if (!nombre_usuario) return res.status(400).json({ error: 'nombre_usuario requerido' });

    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuario.puntuacion_total = 0;
    usuario.monedas = 0;
    usuario.inventario = null;
    await usuario.save();

    res.status(200).json({ mensaje: 'Progreso reiniciado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al reiniciar progreso' });
  }
});

// ─── ELIMINAR CUENTA ─────────────────────────────────────────────────────────
router.delete('/cuenta', async (req, res) => {
  try {
    const { nombre_usuario } = req.body;
    if (!nombre_usuario) return res.status(400).json({ error: 'nombre_usuario requerido' });

    const resultado = await Usuario.findOneAndDelete({ nombre_usuario });
    if (!resultado) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: 'Cuenta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
});

module.exports = router;