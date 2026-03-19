const express = require('express'); // Importa Express para crear el servidor
const mongoose = require('mongoose'); // Importa Mongoose para conectar con MongoDB
const cors = require('cors'); // Importa CORS para permitir comunicación entre frontend y backend
require('dotenv').config(); // Carga las variables del archivo .env

const usuariosRutas = require('./routes/usuarios'); // Importa las rutas de usuarios

const app = express(); // Crea la aplicación Express

// Middlewares — funciones que procesan las peticiones antes de que lleguen al servidor
app.use(cors()); // Permite que el juego se comunique con el servidor
app.use(express.json()); // Permite que el servidor entienda JSON

// Conexión a MongoDB usando la URL guardada en el .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.log('❌ Error al conectar:', err));

// Rutas — cada ruta tiene un prefijo para organizarlas
app.use('/usuarios', usuariosRutas); // Todas las rutas de usuarios empiezan por /usuarios

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('Servidor de La Ley del Gato funcionando 🐱');
});

// Arranca el servidor en el puerto definido en .env o en el 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Servidor corriendo en el puerto ${PORT}');
});
