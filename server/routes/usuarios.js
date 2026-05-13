const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

// ─── RUTA: REGISTRO DE USUARIO ────────────────────────────────────────────────
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

    const esValida = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales no válidas' });
    }

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

// ─── RUTA: ACTUALIZAR PERFIL ──────────────────────────────────────────────────
router.put('/actualizar', async (req, res) => {
  try {
    // Recibimos el nombre del usuario y los datos a cambiar
    const { nombre_usuario, avatar, nueva_contrasena } = req.body;

    // Buscamos al usuario
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si nos envían un nuevo avatar, lo actualizamos
    if (avatar !== undefined) {
      usuario.avatar = avatar;
    }

    // Si nos envían una nueva contraseña, la encriptamos y la guardamos
    if (nueva_contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.hash_contrasena = await bcrypt.hash(nueva_contrasena, salt);
    }

    // Guardamos los cambios en MongoDB
    await usuario.save();

    res.status(200).json({ mensaje: 'Perfil actualizado con éxito' });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error en el servidor al actualizar' });
  }
});
// ─── RUTA: OBTENER INVENTARIO ────────────────────────────────────────────────
router.get('/inventario/:nombre_usuario', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ nombre_usuario: req.params.nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    res.status(200).json({ inventario: usuario.inventario });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar inventario' });
  }
});

// ─── RUTA: GUARDAR INVENTARIO ────────────────────────────────────────────────
router.put('/inventario/guardar', async (req, res) => {
  try {
    const { nombre_usuario, items } = req.body;
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Sobrescribimos el inventario viejo con el nuevo array
    usuario.inventario = items;
    await usuario.save();

    res.status(200).json({ mensaje: 'Inventario sincronizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar inventario' });
  }
});
module.exports = router;