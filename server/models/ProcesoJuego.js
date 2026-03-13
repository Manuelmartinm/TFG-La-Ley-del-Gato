const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que guarda el progreso global del jugador y su puntuación total
const progresoJuegoEsquema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Usuario
    ref: 'Usuario', // Apunta a la colección Usuario
    required: true // Es obligatorio saber a qué usuario pertenece el progreso
  },

  puntuacion_total: {
    type: Number, // Es un número entero
    default: 0 // Al empezar, la puntuación es 0
  },

  ultimo_guardado: {
    type: Date,
    default: Date.now // Se actualiza cada vez que el jugador guarda su progreso
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('ProgresoJuego', progresoJuegoEsquema);