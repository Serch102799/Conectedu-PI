const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 



app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/logs', require('./routes/logs.routes'));
app.use('/api/cursos', require('./routes/cursos.routes'));
app.use('/api/tutorias', require('./routes/tutorias.routes'));
app.use('/api/notificaciones', require('./routes/notificaciones.routes'));
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = `
            SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash, u.estado, u.estilo_vak, r.nombre_rol 
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
        }

        const usuario = result.rows[0];

         if (password !== usuario.password_hash) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
        }

        if (usuario.estado === 'pendiente') {
            return res.status(403).json({ mensaje: 'Tu cuenta está pendiente de aprobación por un Administrador.' });
        }

        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                rol: usuario.nombre_rol,
                vak: usuario.estilo_vak || 'Por definir'
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { nombre_completo, email, password, estilo_vak, id_rol } = req.body;
        
        // Verificar si el correo ya existe
        const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }

        // Insertar usuario con estado pendiente
        const query = `
            INSERT INTO usuarios (id_rol, nombre_completo, email, password_hash, estado, estilo_vak) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario
        `;
        // Para registro inicial, el estado es 'pendiente'
        await pool.query(query, [id_rol || 3, nombre_completo, email, password, 'pendiente', estilo_vak]);

        // NOTIFICAR A TODOS LOS ADMINISTRADORES
        const admins = await pool.query('SELECT id_usuario FROM usuarios WHERE id_rol = 1');
        const { crearNotificacion } = require('./controllers/notificaciones.controller');
        
        for (let admin of admins.rows) {
            await crearNotificacion(
                admin.id_usuario, 
                `Nuevo registro pendiente de aprobación: ${nombre_completo} (${estilo_vak})`, 
                'alerta', 
                '/plataforma/usuarios-admin'
            );
        }

        res.status(201).json({ mensaje: 'Registro exitoso. Esperando aprobación.' });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al registrar.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});