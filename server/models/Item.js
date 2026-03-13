const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que representa los objetos disponibles en el juego (cosméticos, útiles, skins...)
const itemEsquema = new mongoose.Schema({

  nombre: {
    type: String, // Es un texto
    required: true // Es obligatorio que cada item tenga nombre
  },

  categoria: {
    type: String,
    enum: ['SKIN', 'UTIL', 'COSMETICO'], // Solo puede ser uno de estos valores
    required: true // Es obligatorio saber qué tipo de objeto es
  },

  rareza: {
    type: String, // Es un texto (por ejemplo: COMUN, RARO, EPICO, LEGENDARIO)
    required: true // Es obligatorio que cada item tenga rareza
  },

  solo_premium: {
    type: Boolean, // true = solo para usuarios premium, false = para todos
    default: false // Por defecto cualquier usuario puede obtenerlo
  },

  tiene_efecto: {
    type: Boolean, // true = el objeto tiene algún efecto en el juego
    default: false // Por defecto los objetos no tienen efecto
  },

  descripcion_efecto: {
    type: String, // Es un texto describiendo el efecto
    default: null // Es null si el objeto no tiene efecto
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Item', itemEsquema);
