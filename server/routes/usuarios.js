const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Usuario = require('../models/Usuario'); // Asegúrate de que la ruta a tu modelo sea correcta
const { enviarEmailVerificacion, enviarEmailRecuperacion } = require('../utils/email');

// ─── RUTA: REGISTRO DE USUARIO ────────────────────────────────────────────────
router.post('/registro', async (req, res) => {
  try {
    const { nombre_usuario, email, contrasena, avatar } = req.body;

    // 1. Verificar si el usuario o email ya existen
    const usuarioExiste = await Usuario.findOne({ 
      $or: [{ email }, { nombre_usuario }] 
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: 'El nombre de usuario o el email ya están registrados' });
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hash_contrasena = await bcrypt.hash(contrasena, salt);

    // 3. Crear token de verificación único
    const token_verificacion = crypto.randomBytes(32).toString('hex');

    // 4. Crear nuevo usuario (estado verificado: false)
    const nuevoUsuario = new Usuario({
      nombre_usuario,
      email,
      hash_contrasena,
      avatar: avatar || 0,
      email_verificado: false,
      token_verificacion
    });

    await nuevoUsuario.save();

    // 5. Enviar el email (usando la función de utils/email.js)
    // Pasamos el email, el nombre, el token y el índice del avatar
    await enviarEmailVerificacion(email, nombre_usuario, token_verificacion, avatar);

    res.status(201).json({ mensaje: 'Usuario creado. Por favor, verifica tu email.' });

  } catch (error) {
    console.error('ERROR DETALLADO EN REGISTRO:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// ─── RUTA: VERIFICAR EMAIL ────────────────────────────────────────────────────
router.get('/verificar/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Buscamos al usuario por el token
    const usuario = await Usuario.findOne({ token_verificacion: token });

    if (!usuario) {
      return res.status(400).send('<h1>El enlace de verificación no es válido o ha expirado.</h1>');
    }

    // Activamos la cuenta
    usuario.email_verificado = true;
    usuario.token_verificacion = null; // Limpiamos el token
    await usuario.save();

    // Respuesta visual de éxito
    res.send(`
      <body style="background:#080601; color:#c8a030; font-family:monospace; text-align:center; padding-top:100px; margin:0;">
        <h1 style="letter-spacing:5px; border: 2px solid #c8a030; display:inline-block; padding:20px;">✔ IDENTIDAD CONFIRMADA</h1>
        <p style="margin-top:20px; font-size:1.2em;">Agente <strong>${usuario.nombre_usuario}</strong>, tu acceso ha sido activado.</p>
        <br><br>
        <a href="http://localhost:3000/login/login.html" style="background:#c8a030; color:#000; padding:15px 30px; text-decoration:none; font-weight:bold; border-radius:5px;">VOLVER AL LOGIN</a>
      </body>
    `);

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).send('Error interno al verificar el email');
  }
});

// ─── RUTA: LOGIN ──────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identificador, contrasena } = req.body;

    // Buscamos por nombre o por email
    const usuario = await Usuario.findOne({
      $or: [{ nombre_usuario: identificador }, { email: identificador }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Credenciales no válidas' });
    }

    // Comprobamos si está verificado
    if (!usuario.email_verificado) {
      return res.status(401).json({ error: 'Debes verificar tu email antes de entrar' });
    }

    // Comprobamos contraseña
    const esValida = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales no válidas' });
    }

    // Login exitoso
    res.status(200).json({
      mensaje: 'Acceso concedido',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre_usuario,
        avatar: usuario.avatar
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;