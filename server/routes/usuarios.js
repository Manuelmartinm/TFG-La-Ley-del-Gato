const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const { enviarEmailVerificacion } = require('../utils/email');

const router = express.Router();

// ─── REGISTRO ────────────────────────────────────────────────────────────────
// POST /usuarios/registro — crea un usuario nuevo y envía email de verificación
router.post('/registro', async (req, res) => {
  try {
    const { nombre_usuario, contrasena, email, avatar } = req.body;

    // Comprueba si ya existe un usuario con ese nombre
    const usuarioExistente = await Usuario.findOne({ nombre_usuario });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Comprueba si ya existe un usuario con ese email
    const emailExistente = await Usuario.findOne({ email });
    if (emailExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Cifra la contraseña antes de guardarla
    const hash_contrasena = await bcrypt.hash(contrasena, 10);

    // Genera un token único de verificación
    const token_verificacion = crypto.randomBytes(32).toString('hex');

    // Crea el nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre_usuario,
      email,
      hash_contrasena,
      avatar: avatar || 0,
      token_verificacion
    });

    await nuevoUsuario.save();

    // Envía el email de verificación
    await enviarEmailVerificacion(email, nombre_usuario, token_verificacion, avatar || 0);

    res.status(201).json({ mensaje: 'Usuario creado correctamente. Revisa tu email para verificar tu cuenta.' });

  } catch (error) {
    console.log('ERROR DETALLADO:', error.message);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────────
// GET /usuarios/verificar/:token — verifica el email del usuario
router.get('/verificar/:token', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ token_verificacion: req.params.token });

    if (!usuario) {
      return res.status(400).send('Token de verificación inválido o expirado');
    }

    // Marca el email como verificado y elimina el token
    usuario.email_verificado = true;
    usuario.token_verificacion = null;
    await usuario.save();

    res.send(`
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="background:#080601;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:monospace">
        <div style="text-align:center;color:#c8a030">
          <div style="font-size:64px">🐭</div>
          <h1 style="letter-spacing:4px;font-size:18px">¡CUENTA VERIFICADA!</h1>
          <p style="color:#a07830;letter-spacing:2px">Ya puedes acceder a todas las funciones del sistema</p>
          <a href="/login/login.html" style="color:#c8a030;letter-spacing:2px">▶ INICIAR SESIÓN</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send('Error al verificar el email');
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /usuarios/login — inicia sesión con usuario o email
router.post('/login', async (req, res) => {
  try {
    const { identificador, contrasena } = req.body;

    // Busca por nombre_usuario O por email
    const usuario = await Usuario.findOne({
      $or: [
        { nombre_usuario: identificador },
        { email: identificador }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Comprueba si el email está verificado
    if (!usuario.email_verificado) {
      return res.status(401).json({ error: 'Debes verificar tu email antes de iniciar sesión' });
    }

    const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!contrasenaCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    usuario.ultimo_acceso = Date.now();
    await usuario.save();

    res.status(200).json({
      mensaje: 'Login correcto',
      nombre_usuario: usuario.nombre_usuario,
      avatar: usuario.avatar,
      token: usuario._id,
      email: usuario.email,
      email_verificado: usuario.email_verificado,
      fecha_creacion: usuario.fecha_creacion
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ─── RECUPERAR CONTRASEÑA ─────────────────────────────────────────────────────
// POST /usuarios/recuperar — envía email de recuperación
router.post('/recuperar', async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // No revelamos si el email existe o no por seguridad
      return res.status(200).json({ mensaje: 'Si el email existe recibirás un código' });
    }

    const token_recuperacion = crypto.randomBytes(32).toString('hex');
    usuario.token_verificacion = token_recuperacion;
    await usuario.save();

    const { enviarEmailRecuperacion } = require('../utils/email');
    await enviarEmailRecuperacion(email, usuario.nombre_usuario, token_recuperacion);

    res.status(200).json({ mensaje: 'Si el email existe recibirás un código' });

  } catch (error) {
    console.log('ERROR DETALLADO:', error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// ─── OBTENER USUARIO ──────────────────────────────────────────────────────────
// GET /usuarios/:id — obtiene los datos de un usuario por su id
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});
// ─── ACTUALIZAR PERFIL ────────────────────────────────────────────────────────
// PUT /usuarios/perfil — actualiza nombre, avatar, email y/o contraseña
router.put('/perfil', async (req, res) => {
  try {
    const { nombre_usuario, avatar, email, contrasena_actual, contrasena_nueva } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });

    const usuario = await Usuario.findById(token);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (nombre_usuario) usuario.nombre_usuario = nombre_usuario;
    if (avatar !== undefined) usuario.avatar = avatar;
    if (email) usuario.email = email;

    if (contrasena_nueva) {
      const ok = await bcrypt.compare(contrasena_actual, usuario.hash_contrasena);
      if (!ok) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      usuario.hash_contrasena = await bcrypt.hash(contrasena_nueva, 10);
    }

    await usuario.save();
    res.status(200).json({ mensaje: 'Perfil actualizado', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});
module.exports = router;