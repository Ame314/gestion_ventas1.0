const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  const { nombre, email, contrasea } = req.body;

  if (!nombre || !email || !contrasea) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  try {
    // Verificar si el correo ya está registrado
    const checkEmailQuery = 'SELECT * FROM Usuarios WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al verificar el email: ' + err.message);
      }
      if (results.length > 0) {
        return res.status(400).send('El correo electrónico ya está registrado');
      }

      // Si el correo no está registrado, proceder con el hash de la contraseña
      const hashedPassword = await bcrypt.hash(contrasea, 10);
      const query = 'INSERT INTO Usuarios (nombre, email, contrasea) VALUES (?, ?, ?)';
      const values = [nombre, email, hashedPassword];

      db.query(query, values, (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error al registrar el usuario: ' + err.message);
        }
        res.status(201).send('Usuario registrado exitosamente');
      });
    });
  } catch (error) {
    res.status(500).send('Error interno del servidor: ' + error.message);
  }
});

router.post('/login', (req, res) => {
  const { email, contrasea } = req.body;
  const query = 'SELECT * FROM Usuarios WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send('Error en la base de datos');
    if (results.length === 0) return res.status(404).send('Usuario no encontrado');

    const user = results[0];
    const isMatch = await bcrypt.compare(contrasea, user.contrasea);
    if (!isMatch) return res.status(400).send('Contraseña incorrecta');

    const { contrasea: _, ...userData } = user;
    res.status(200).json({ user: userData });
  });
});

module.exports = router;
