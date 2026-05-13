const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const usuariosRutas = require('./routes/usuarios');
const pagosRutas    = require('./routes/pagos');

const app = express();

app.use(cors());
app.use(express.json());

// Sirve los archivos estáticos del cliente
app.use(express.static(path.join(__dirname, '../client')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.log('❌ Error al conectar:', err));

// Rutas de la API
app.use('/usuarios', usuariosRutas);
app.use('/pagos', pagosRutas);

// Ruta raíz — sirve el login directamente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login/login.html'));
});

// Arranca el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  
const pagoRoutes = require('./routes/pago'); 
app.use('/pagos', pagoRoutes);
});