// server.js
const express = require('express');
const bodyParser = require('body-parser');
const productosRouter = require('./routes/productos'); // Asegúrate de que la ruta sea correcta
const db = require('./db'); // Asegúrate de que tu archivo de conexión a la base de datos esté configurado

const app = express();
const PORT = 3000;

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

// Usar las rutas de productos
app.use('/api/productos', productosRouter);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});