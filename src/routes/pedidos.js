const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const db = require('../db');

// Obtener todos los pedidos
router.get('/', (req, res) => {
  db.query('SELECT * FROM pedidos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear un nuevo pedido
router.post('/', (req, res) => {
  const { id_producto, cantidad } = req.body;
  db.query('INSERT INTO pedidos (id_producto, cantidad) VALUES (?, ?)', [id_producto, cantidad], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido creado correctamente.' });
  });
});

// Actualizar un pedido
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { id_producto, cantidad } = req.body;
  db.query('UPDATE pedidos SET id_producto = ?, cantidad = ? WHERE id = ?', [id_producto, cantidad, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido actualizado correctamente.' });
  });
});

// Eliminar un pedido
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pedidos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido eliminado correctamente.' });
  });
});

module.exports = router;
