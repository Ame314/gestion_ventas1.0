const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const router = express.Router();
const db = require('../db');

// Configuración de la sesión
router.use(session({
  secret: '6.62606', // Cambia esto por un secreto más seguro en producción
  resave: false,
  saveUninitialized: false, // No guardar sesiones vacías
  cookie: {
    secure: false, // Cambia a true si usas HTTPS
    httpOnly: true, // Asegura que la cookie no sea accesible desde JavaScript del cliente
    maxAge: 1000 * 60 * 60 * 24 // Tiempo de expiración (1 día)
  }
}));

// Ruta para verificar conexión a rutas de usuarios
router.get('/', (req, res) => {
  res.send('Ruta de usuarios');
});

// Registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, email, pass, direccion, telefono, rol = 'user' } = req.body; // rol predeterminado

  // Validar campos obligatorios
  if (!nombre || !email || !pass || !direccion || !telefono) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  try {
    // Verificar si el email ya está registrado
    const checkEmailQuery = 'SELECT * FROM Clientes WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) return res.status(500).send('Error al verificar el email: ' + err.message);
      if (results.length > 0) return res.status(400).send('El correo electrónico ya está registrado');

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(pass, 10);
      const query = 'INSERT INTO Clientes (nombre, email, pass, rol, direccion, telefono) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [nombre, email, hashedPassword, rol, direccion, telefono]; // Usar rol

      // Insertar el nuevo usuario en la base de datos
      db.query(query, values, (err) => {
        if (err) return res.status(500).send('Error al registrar el usuario: ' + err.message);
        res.status(201).send('Usuario registrado exitosamente');
      });
    });
  } catch (error) {
    res.status(500).send('Error interno del servidor: ' + error.message);
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, pass } = req.body;

  // Validar campos obligatorios
  if (!email || !pass) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  const query = 'SELECT * FROM Clientes WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send('Error en la base de datos');
    if (results.length === 0) return res.status(404).send('Usuario no encontrado');

    const user = results[0];
    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) return res.status(400).send('Contraseña incorrecta');

    // Guardar la sesión
    req.session.userId = user.id;
    req.session.userName = user.nombre;
    req.session.userRole = user.rol;

    // Devolver los datos del usuario
    res.status(200).json({ 
      message: 'Login exitoso', 
      user: { nombre: user.nombre, rol: user.rol } 
    });
  });
});

// Obtener datos del usuario autenticado
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('No has iniciado sesión');
  }

  // Devolver los datos básicos del usuario desde la sesión
  res.status(200).json({ 
    id: req.session.userId, 
    nombre: req.session.userName, 
    rol: req.session.userRole 
  });
});

// Middleware para verificar roles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.userRole || !roles.includes(req.session.userRole)) {
      return res.status(403).send('Acceso denegado');
    }
    next();
  };
};

// Ruta protegida para administradores
router.get('/admin', checkRole(['admin']), (req, res) => {
  res.status(200).send(`Bienvenido al panel de administrador, ${req.session.userName}`);
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.status(200).send('Sesión cerrada exitosamente');
  });
});

module.exports = router;