const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Módulo nativo de Node para generar tokens únicos
const Usuario = require('../models/Usuario');
const { enviarEmailVerificacion } = require('../utils/email'); // Importa la función de email

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
    // Busca el usuario con ese token
    const usuario = await Usuario.findOne({ token_verificacion: req.params.token });

    if (!usuario) {
      return res.status(400).send('Token de verificación inválido o expirado');
    }

    // Marca el email como verificado y elimina el token
    usuario.email_verificado = true;
    usuario.token_verificacion = null;
    await usuario.save();

    // Redirige a una página de éxito
    res.send(`
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="background:#080601;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:monospace">
        <div style="text-align:center;color:#c8a030">
          <div style="font-size:64px">🐭</div>
          <h1 style="letter-spacing:4px;font-size:18px">¡CUENTA VERIFICADA!</h1>
          <p style="color:#a07830;letter-spacing:2px">Ya puedes acceder a todas las funciones del sistema</p>
          <a href="/login.html" style="color:#c8a030;letter-spacing:2px">▶ INICIAR SESIÓN</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send('Error al verificar el email');
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /usuarios/login — inicia sesión con un usuario existente
router.post('/login', async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body;

    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!contrasenaCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    usuario.ultimo_acceso = Date.now();
    await usuario.save();

    res.status(200).json({ mensaje: 'Login correcto', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
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

module.exports = router;