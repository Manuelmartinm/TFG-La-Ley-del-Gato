const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que relaciona los usuarios con los objetos que poseen en su inventario
const inventarioItemsEsquema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Usuario
    ref: 'Usuario', // Apunta a la colección Usuario
    required: true // Es obligatorio saber a qué usuario pertenece el inventario
  },

  item_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Item
    ref: 'Item', // Apunta a la colección Item
    required: true // Es obligatorio saber qué objeto tiene el usuario
  },

  cantidad: {
    type: Number, // Es un número entero
    default: 1 // Por defecto el usuario tiene 1 unidad del objeto
  },

  equipado: {
    type: Boolean, // true = el objeto está equipado, false = no está equipado
    default: false // Por defecto el objeto no está equipado
  },

  fecha_adquisicion: {
    type: Date,
    default: Date.now // Se rellena automáticamente con la fecha en que se obtuvo el objeto
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('InventarioItems', inventarioItemsEsquema);