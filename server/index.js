const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const usuariosRutas = require('./routes/usuarios');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.log('❌ Error al conectar:', err));

app.use('/usuarios', usuariosRutas);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login/login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});