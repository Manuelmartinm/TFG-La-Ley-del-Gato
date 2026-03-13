const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Definimos el esquema — la estructura que tendrá cada usuario en la base de datos
const usuarioEsquema = new mongoose.Schema({

  nombre_usuario: {
    type: String, // Es un texto
    required: true, // Es obligatorio
    unique: true // No puede haber dos usuarios con el mismo nombre
  },

  hash_contrasena: {
    type: String, // Es un texto (guardamos la contraseña cifrada, nunca en texto plano)
    required: true // Es obligatorio
  },

  rol: {
    type: String,
    enum: ['ANONIMO', 'REGISTRADO', 'PREMIUM'], // Solo puede ser uno de estos tres valores
    default: 'ANONIMO' // Si no se especifica, por defecto es ANONIMO
  },

  fecha_creacion: {
    type: Date,
    default: Date.now // Se rellena automáticamente con la fecha actual al crear el usuario
  },

  ultimo_acceso: {
    type: Date,
    default: Date.now // Se actualiza cada vez que el usuario inicia sesión
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Usuario', usuarioEsquema);