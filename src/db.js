require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',  
  port: 3307,         // Puerto del contenedor
  user: 'root',       // Usuario de tu base de datos
  password: '1234',   // Contraseña de tu base de datos
  database: 'gestion_ventas' // Nombre de la base de datos
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = connection;
