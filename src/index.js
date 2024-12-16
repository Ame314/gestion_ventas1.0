require('dotenv').config(); // Carga variables de entorno
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite solicitudes desde diferentes dominios
app.use(express.json()); // Permite manejar JSON en las solicitudes

// Rutas
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const usuariosRouter = require('./routes/usuarios');

app.use('/api/usuarios', usuariosRouter);
app.use('/usuarios', usuariosRouter);  // Prefijo /usuarios
app.use('/productos', productosRoutes); // Prefijo /productos
app.use('/pedidos', pedidosRoutes);     // Prefijo /pedidos

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
