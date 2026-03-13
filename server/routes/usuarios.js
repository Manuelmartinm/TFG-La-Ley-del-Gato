const express = require('express'); // Importa Express para crear las rutas
const bcrypt = require('bcrypt'); // Importa bcrypt para cifrar contraseñas
const Usuario = require('../models/Usuario'); // Importa el modelo Usuario

const router = express.Router(); // Crea un router — agrupa todas las rutas de usuarios

// ─── REGISTRO ────────────────────────────────────────────────────────────────
// POST /usuarios/registro — crea un usuario nuevo en la base de datos
router.post('/registro', async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body; // Recoge los datos del formulario

    // Comprueba si ya existe un usuario con ese nombre
    const usuarioExistente = await Usuario.findOne({ nombre_usuario });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Cifra la contraseña antes de guardarla (10 = nivel de seguridad)
    const hash_contrasena = await bcrypt.hash(contrasena, 10);

    // Crea el nuevo usuario con los datos recibidos
    const nuevoUsuario = new Usuario({ nombre_usuario, hash_contrasena });
    await nuevoUsuario.save(); // Guarda el usuario en la base de datos

    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /usuarios/login — inicia sesión con un usuario existente
router.post('/login', async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body; // Recoge los datos del formulario

    // Busca el usuario en la base de datos
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Compara la contraseña recibida con la cifrada en la base de datos
    const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.hash_contrasena);
    if (!contrasenaCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Actualiza la fecha del último acceso
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
    const usuario = await Usuario.findById(req.params.id); // Busca el usuario por id
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

module.exports = router; // Exporta el router para usarlo en index.js