const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que registra todas las compras realizadas por los usuarios
const compraEsquema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Usuario
    ref: 'Usuario', // Apunta a la colección Usuario
    required: true // Es obligatorio saber qué usuario realizó la compra
  },

  catalogo_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un CatalogoTienda
    ref: 'CatalogoTienda', // Apunta a la colección CatalogoTienda
    required: true // Es obligatorio saber qué objeto se compró
  },

  tipo_pago: {
    type: String,
    enum: ['MONEDAS', 'DINERO_REAL'], // Solo puede ser uno de estos dos valores
    required: true // Es obligatorio saber cómo se pagó
  },

  monedas_gastadas: {
    type: Number, // Es un número entero
    default: 0 // Si se pagó con dinero real, las monedas gastadas son 0
  },

  importe_real: {
    type: Number, // Es un número decimal (euros, dólares...)
    default: 0 // Si se pagó con monedas, el importe real es 0
  },

  estado: {
    type: String,
    enum: ['PENDIENTE', 'COMPLETADA', 'FALLIDA'], // Solo puede ser uno de estos valores
    default: 'PENDIENTE' // Al crear la compra, por defecto está pendiente
  },

  fecha_compra: {
    type: Date,
    default: Date.now // Se rellena automáticamente con la fecha de la compra
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Compra', compraEsquema);