const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que almacena el ranking de jugadores basado en la puntuación total
const rankingEsquema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Usuario
    ref: 'Usuario', // Apunta a la colección Usuario
    required: true, // Es obligatorio saber qué usuario está en el ranking
    unique: true // Solo puede haber una entrada por usuario en el ranking
  },

  puntuacion_total: {
    type: Number, // Es un número entero
    default: 0 // Al entrar en el ranking la puntuación empieza en 0
  },

  fecha_registro: {
    type: Date,
    default: Date.now // Se actualiza cada vez que cambia la puntuación del usuario
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Ranking', rankingEsquema);