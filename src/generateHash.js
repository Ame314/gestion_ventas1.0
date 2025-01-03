const bcrypt = require('bcrypt');

// Contraseña que deseas cifrar
const adminPassword = '6.62606';

// Generar el hash
bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) {
        console.error('Error al cifrar la contraseña:', err);
    } else {
        console.log('Hash cifrado:', hash);
    }
});
