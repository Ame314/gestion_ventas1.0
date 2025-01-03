// routes/productos.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos
router.get('/', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
  const { nombre, descripcion, precio, cantidad, url_imagen } = req.body;

  // Validar que todos los campos necesarios estén presentes
  if (!nombre || !descripcion || !precio || !cantidad || !url_imagen) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  db.query('INSERT INTO productos (nombre, descripcion, precio, cantidad, url_imagen) VALUES (?, ?, ?, ?, ?)', 
    [nombre, descripcion, precio, cantidad, url_imagen], 
    (err) => {
      if (err) {
        console.error('Error al agregar el producto:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Producto creado correctamente.' });
  });
});

// Actualizar un producto
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, cantidad, url_imagen } = req.body;

  db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?, url_imagen = ? WHERE id = ?', 
    [nombre, descripcion, precio, cantidad, url_imagen, id], 
    (err) => {
      if (err) {
        console.error('Error al actualizar el producto:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Producto actualizado correctamente.' });
  });
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error al eliminar el producto:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Producto eliminado correctamente.' });
  });
});

// Ruta para buscar productos por nombre
router.get('/search', (req, res) => {
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).send('El nombre del producto es obligatorio');
  }

  const query = 'SELECT * FROM productos WHERE nombre LIKE ?';
  db.query(query, [`%${nombre}%`], (err, results) => {
    if (err) {
      console.error('Error al realizar la búsqueda:', err);
      return res.status(500).send('Error al realizar la búsqueda');
    }

    res.json(results);  // Devolver los productos que coinciden con el término de búsqueda
  });
});

module.exports = router;