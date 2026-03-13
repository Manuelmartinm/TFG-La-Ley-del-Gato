const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que representa la compra única del acceso premium de un usuario
const accesoPremiumEsquema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Usuario
    ref: 'Usuario', // Le decimos que apunta a la colección Usuario
    required: true // Es obligatorio saber qué usuario compró el premium
  },

  fecha_compra: {
    type: Date,
    default: Date.now // Se rellena automáticamente con la fecha de compra
  },

  activo: {
    type: Boolean, // true = premium activo, false = premium desactivado
    default: true // Al comprar, por defecto está activo
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('AccesoPremium', accesoPremiumEsquema);