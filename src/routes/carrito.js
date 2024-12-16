const express = require('express');
const db = require('../db');
const router = express.Router();

// Ruta para agregar un producto al carrito
router.post('/add', (req, res) => {
  const { userId, productId, cantidad } = req.body;

  // Verificar si el producto ya está en el carrito
  const query = 'SELECT * FROM Carrito WHERE user_id = ? AND product_id = ?';
  db.query(query, [userId, productId], (err, results) => {
    if (err) return res.status(500).send('Error en la base de datos');

    if (results.length > 0) {
      // Si el producto ya está en el carrito, actualizar la cantidad
      const updateQuery = 'UPDATE Carrito SET cantidad = cantidad + ? WHERE user_id = ? AND product_id = ?';
      db.query(updateQuery, [cantidad, userId, productId], (err) => {
        if (err) return res.status(500).send('Error al actualizar el carrito');
        res.status(200).send('Producto actualizado en el carrito');
      });
    } else {
      // Si el producto no está en el carrito, agregarlo
      const insertQuery = 'INSERT INTO Carrito (user_id, product_id, cantidad) VALUES (?, ?, ?)';
      db.query(insertQuery, [userId, productId, cantidad], (err) => {
        if (err) return res.status(500).send('Error al agregar el producto al carrito');
        res.status(201).send('Producto agregado al carrito');
      });
    }
  });
});

// Ruta para obtener los productos del carrito de un usuario
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const query = 'SELECT p.nombre, p.precio, c.cantidad FROM Carrito c JOIN Productos p ON c.product_id = p.id WHERE c.user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send('Error al obtener el carrito');
    res.status(200).json(results);
  });
});

// Ruta para eliminar un producto del carrito
router.delete('/remove', (req, res) => {
  const { userId, productId } = req.body;

  const query = 'DELETE FROM Carrito WHERE user_id = ? AND product_id = ?';
  db.query(query, [userId, productId], (err) => {
    if (err) return res.status(500).send('Error al eliminar el producto del carrito');
    res.status(200).send('Producto eliminado del carrito');
  });
});

module.exports = router;