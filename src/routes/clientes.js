// routes/clientes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los clientes y sus pedidos
router.get('/', (req, res) => {
  db.query('SELECT * FROM clientes', (err, clients) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Suponiendo que tienes una tabla de pedidos relacionada
    db.query('SELECT * FROM pedidos', (err, pedidos) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Agrupar pedidos por cliente
      const clientsWithOrders = clients.map(client => ({
        ...client,
        pedidos: pedidos.filter(pedido => pedido.cliente_id === client.id) // Ajusta según tu estructura de datos
      }));

      res.json(clientsWithOrders);
    });
  });
});

module.exports = router;