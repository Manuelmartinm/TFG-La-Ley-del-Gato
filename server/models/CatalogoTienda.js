const mongoose = require('mongoose'); // Importa Mongoose para crear el modelo

// Esquema que define los objetos disponibles en la tienda y su precio
const catalogoTiendaEsquema = new mongoose.Schema({

  item_id: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al id de un Item
    ref: 'Item', // Apunta a la colección Item
    required: true // Es obligatorio saber qué objeto se vende
  },

  precio_monedas: {
    type: Number, // Es un número entero
    default: 0 // Por defecto el objeto es gratis en monedas del juego
  },

  precio_real: {
    type: Number, // Es un número decimal (euros, dólares...)
    default: 0 // Por defecto el objeto no tiene precio en dinero real
  },

  es_catalogo_premium: {
    type: Boolean, // true = pertenece a la tienda premium, false = tienda normal
    default: false // Por defecto pertenece a la tienda normal
  },

  activo: {
    type: Boolean, // true = el objeto está disponible para comprar
    default: true // Por defecto el objeto está disponible
  }

});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('CatalogoTienda', catalogoTiendaEsquema);