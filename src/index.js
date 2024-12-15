const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(cors()); // Allow cross-origin requests

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: '172.17.0.4',
  user: 'root',
  password: '1234',
  database: 'gestion_ventas',
});

// Conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});


app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Gestión de Ventas</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f3f4f6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          h1 {
            color: #4CAF50;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .section {
            margin-bottom: 20px;
            padding: 20px;
            background: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
          }
          button:hover {
            background-color: #45a049;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Gestión de Ventas</h1>

          <!-- Productos -->
          <div class="section">
            <h2>Productos</h2>
            <table id="productos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
            <h3>Agregar Producto</h3>
            <form id="agregar-producto-form">
              <input type="text" id="nombre" placeholder="Nombre" required>
              <input type="text" id="descripcion" placeholder="Descripción" required>
              <input type="number" id="precio" placeholder="Precio" required>
              <input type="number" id="cantidad" placeholder="Cantidad" required>
              <button type="submit">Agregar</button>
            </form>
          </div>

          <!-- Pedidos -->
          <div class="section">
            <h2>Realizar Pedido</h2>
            <form id="pedido-form">
              <input type="number" id="cliente-id" placeholder="ID Cliente" required>
              <textarea id="productos-pedido" placeholder="Productos en formato JSON" required>
  [
    {"nombre": "Producto1", "cantidad": 2, "precio": 12.50},
    {"nombre": "Producto2", "cantidad": 1, "precio": 25.00}
  ]
              </textarea>
              <button type="submit">Realizar Pedido</button>
            </form>
          </div>
        </div>

        <script>
          // Cargar productos
          async function cargarProductos() {
            const response = await fetch('/productos');
            const productos = await response.json();
            const tbody = document.querySelector('#productos-table tbody');
            tbody.innerHTML = '';
            productos.forEach(producto => {
              const tr = document.createElement('tr');
              tr.innerHTML = \`
                <td>\${producto.id}</td>
                <td>\${producto.nombre}</td>
                <td>\${producto.descripcion}</td>
                <td>\${producto.precio}</td>
                <td>\${producto.cantidad}</td>
                <td>
                  <button onclick="borrarProducto(\${producto.id})">Borrar</button>
                </td>
              \`;
              tbody.appendChild(tr);
            });
          }

          // Agregar producto
          document.getElementById('agregar-producto-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const descripcion = document.getElementById('descripcion').value;
            const precio = document.getElementById('precio').value;
            const cantidad = document.getElementById('cantidad').value;

            const response = await fetch('/productos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombre, descripcion, precio, cantidad })
            });

            if (response.ok) {
              alert('Producto agregado exitosamente');
              cargarProductos();
            } else {
              alert('Error al agregar producto');
            }
          });

          // Borrar producto
          async function borrarProducto(id) {
            const response = await fetch(\`/productos/\${id}\`, { method: 'DELETE' });
            if (response.ok) {
              alert('Producto eliminado');
              cargarProductos();
            } else {
              alert('Error al eliminar producto');
            }
          }

          // Realizar pedido
          document.getElementById('pedido-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cliente_id = document.getElementById('cliente-id').value;
            const productos = JSON.parse(document.getElementById('productos-pedido').value);

            // Obtener IDs de los productos por nombre
            const productosConId = await Promise.all(productos.map(async (producto) => {
              const res = await fetch('/productos/buscar?nombre=' + producto.nombre);
              const productoDb = await res.json();
              return {
                producto_id: productoDb.id,
                cantidad: producto.cantidad,
                precio: producto.precio
              };
            }));

            const response = await fetch('/pedidos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cliente_id, productos: productosConId })
            });

            if (response.ok) {
              alert('Pedido realizado exitosamente');
            } else {
              alert('Error al realizar pedido');
            }
          });

          // Inicializar
          cargarProductos();
        </script>
      </body>
    </html>
  `);
});


// Ruta para agregar productos
app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, cantidad } = req.body;

  if (!nombre || !descripcion || !precio || !cantidad) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  const query = 'INSERT INTO productos (nombre, descripcion, precio, cantidad) VALUES (?, ?, ?, ?)';
  const values = [nombre, descripcion, precio, cantidad];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error al agregar producto:', err.stack);
      res.status(500).send('Error al agregar producto');
      return;
    }
    res.status(201).send('Producto agregado exitosamente');
  });
});

// Ruta para obtener todos los productos
app.get('/productos', (req, res) => {
  const query = 'SELECT * FROM productos';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err.stack);
      res.status(500).send('Error al obtener productos');
      return;
    }
    res.status(200).json(results);
  });
});

// Ruta para eliminar un producto por ID
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM productos WHERE id = ?';

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar producto:', err.stack);
      res.status(500).send('Error al eliminar producto');
      return;
    }
    res.status(200).send('Producto eliminado exitosamente');
  });
});

// Ruta para buscar producto por nombre
app.get('/productos/buscar', (req, res) => {
  const { nombre } = req.query;

  const query = 'SELECT * FROM productos WHERE nombre = ?';

  connection.query(query, [nombre], (err, results) => {
    if (err) {
      console.error('Error al buscar producto:', err.stack);
      res.status(500).send('Error al buscar producto');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Producto no encontrado');
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Ruta para realizar un pedido
app.post('/pedidos', (req, res) => {
  const { cliente_id, productos } = req.body;

  if (!cliente_id || !productos || !Array.isArray(productos)) {
    return res.status(400).send('Datos incompletos o inválidos');
  }

  const pedidoQuery = 'INSERT INTO pedidos (cliente_id) VALUES (?)';

  connection.query(pedidoQuery, [cliente_id], (err, result) => {
    if (err) {
      console.error('Error al crear pedido:', err.stack);
      res.status(500).send('Error al crear pedido');
      return;
    }

    const pedidoId = result.insertId;
    const detallesQuery = 'INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio) VALUES ?';

    const detallesValues = productos.map((producto) => [
      pedidoId,
      producto.producto_id,
      producto.cantidad,
      producto.precio,
    ]);

    connection.query(detallesQuery, [detallesValues], (err) => {
      if (err) {
        console.error('Error al agregar detalles del pedido:', err.stack);
        res.status(500).send('Error al agregar detalles del pedido');
        return;
      }

      res.status(201).send('Pedido realizado exitosamente');
    });
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});