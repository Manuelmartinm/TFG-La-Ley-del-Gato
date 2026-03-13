const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que define el calendario mensual de recompensas diarias del juego
const recompensaMensualEsquema = new mongoose.Schema({

  anio: {
    type: Number, // Es un número entero (por ejemplo: 2025)
    required: true // Es obligatorio saber a qué año pertenece la recompensa
  },

  mes: {
    type: Number, // Es un número entero (1 = enero, 12 = diciembre)
    required: true, // Es obligatorio saber a qué mes pertenece la recompensa
    min: 1, // Mínimo enero
    max: 12 // Máximo diciembre
  },

  dia_mes: {
    type: Number, // Es un número entero (1-31)
    required: true, // Es obligatorio saber a qué día pertenece la recompensa
    min: 1, // Mínimo día 1
    max: 31 // Máximo día 31
  },

  tipo_reclamo: {
    type: String,
    enum: ['NORMAL', 'PREMIUM'], // Solo puede ser uno de estos dos valores
    required: true // Es obligatorio saber si la recompensa es normal o premium
  },

  tipo_recompensa: {
    type: String,
    enum: ['MONEDAS', 'ITEM'], // Solo puede ser monedas o un objeto
    required: true // Es obligatorio saber qué tipo de recompensa es
  },

  cantidad: {
    type: Number, // Es un número entero
    default: 0 // Si la recompensa es un item, la cantidad es 0
  },

  item_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Item
    ref: 'Item', // Apunta a la colección Item
    default: null // Es null si la recompensa es monedas y no un objeto
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('RecompensaMensual', recompensaMensualEsquema);