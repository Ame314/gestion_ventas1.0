const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos
router.get('/', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
  const { nombre, precio } = req.body;
  db.query('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [nombre, precio], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto creado correctamente.' });
  });
});

// Actualizar un producto
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;
  db.query('UPDATE productos SET nombre = ?, precio = ? WHERE id = ?', [nombre, precio, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto actualizado correctamente.' });
  });
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto eliminado correctamente.' });
  });
});

module.exports = router;
