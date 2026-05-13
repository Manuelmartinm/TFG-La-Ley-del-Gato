const mongoose = require('mongoose');

const usuarioEsquema = new mongoose.Schema({
  nombre_usuario: {
    type: String, 
    required: true, 
    unique: true 
  },
  hash_contrasena: {
    type: String, 
    required: true 
  },
  rol: {
    type: String,
    enum: ['ANONIMO', 'REGISTRADO', 'PREMIUM'], 
    default: 'REGISTRADO' // Cambiado a REGISTRADO por defecto para el TFG
  },
  fecha_creacion: {
    type: Date,
    default: Date.now 
  },
  ultimo_acceso: {
    type: Date,
    default: Date.now 
  },
  email: {
    type: String,
    required: true, 
    unique: true 
  },
  email_verificado: {
    type: Boolean,
    default: true // <-- CAMBIADO: Ahora nacen verificados
  },
  token_verificacion: {
    type: String,
    default: null 
  },
  avatar: { // Añadido para asegurar que se guarde el índice
    type: Number,
    default: 0
  },
  inventario: { type: Array, default: null }
});

module.exports = mongoose.model('Usuario', usuarioEsquema);