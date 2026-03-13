const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que representa el catálogo de niveles disponibles en el juego
const nivelEsquema = new mongoose.Schema({

  nombre: {
    type: String, // Es un texto
    required: true // Es obligatorio que cada nivel tenga nombre
  },

  modo: {
    type: String,
    enum: ['AVENTURA', 'MINIJUEGO'], // Solo puede ser uno de estos dos valores
    required: true // Es obligatorio saber qué tipo de nivel es
  },

  dificultad: {
    type: Number, // Es un número entero
    required: true // Es obligatorio que cada nivel tenga dificultad
  },

  orden: {
    type: Number, // Es un número entero
    required: true // Es obligatorio para saber en qué posición aparece en el mapa
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Nivel', nivelEsquema);