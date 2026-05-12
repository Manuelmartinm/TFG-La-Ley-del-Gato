const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');

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

    // 3. Crear nuevo usuario (email_verificado: true por defecto)
    const nuevoUsuario = new Usuario({
      nombre_usuario,
      email,
      hash_contrasena,
      avatar: avatar || 0,
      email_verificado: true // Aseguramos que sea true
    });

    await nuevoUsuario.save();

    // 4. RESPUESTA: Ya no intentamos enviar email. Éxito directo.
    res.status(201).json({ mensaje: 'Usuario creado con éxito. Ya puedes iniciar sesión.' });

  } catch (error) {
    console.error('ERROR DETALLADO EN REGISTRO:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// ─── RUTA: LOGIN ──────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identificador, contrasena } = req.body;

    const usuario = await Usuario.findOne({
      $or: [{ nombre_usuario: identificador }, { email: identificador }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Credenciales no válidas' });
    }

    // ELIMINADO: Ya no comprobamos email_verificado. Todos pueden entrar.

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