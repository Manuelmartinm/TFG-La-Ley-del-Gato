const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const usuariosRutas = require('./routes/usuarios');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Sirve los archivos estáticos del cliente
// Así /client/login/login.html es accesible desde el navegador
app.use(express.static(path.join(__dirname, '../client')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.log('❌ Error al conectar:', err));

// Rutas de la API
app.use('/usuarios', usuariosRutas);

// Ruta raíz — redirige al login
app.get('/', (req, res) => {
  res.redirect('/login/login.html');
});

// Arranca el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
