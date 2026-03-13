const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que guarda el progreso detallado de cada usuario en cada nivel
const progresoNivelEsquema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Usuario
    ref: 'Usuario', // Apunta a la colección Usuario
    required: true // Es obligatorio saber qué usuario jugó el nivel
  },

  nivel_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Nivel
    ref: 'Nivel', // Apunta a la colección Nivel
    required: true // Es obligatorio saber qué nivel se jugó
  },

  completado: {
    type: Boolean, // true = nivel completado, false = nivel no completado
    default: false // Al empezar, el nivel no está completado
  },

  mejor_puntuacion: {
    type: Number, // Es un número entero
    default: 0 // Al empezar, la puntuación es 0
  },

  estrellas: {
    type: Number, // Es un número entero (0, 1, 2 o 3 estrellas)
    default: 0, // Al empezar, no tiene estrellas
    min: 0, // Mínimo 0 estrellas
    max: 3 // Máximo 3 estrellas
  },

  fecha_completado: {
    type: Date,
    default: null // Es null hasta que el nivel se complete
  },

  fecha_guardado: {
    type: Date,
    default: Date.now // Se actualiza cada vez que se guarda el progreso del nivel
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('ProgresoNivel', progresoNivelEsquema);