// Archivo: middlewares/auth.middleware.js
const pool = require('../db');

// Mantiene compatibilidad con verificarAdmin o simplemente creamos verificarRoles
const verificarRoles = (rolesPermitidos) => {
    return async (req, res, next) => {
        const idUsuario = req.header('usuario-id');

        if (!idUsuario) {
            return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere ID de usuario.' });
        }

        try {
            const result = await pool.query(`
                SELECT r.nombre_rol 
                FROM usuarios u
                JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = $1
            `, [idUsuario]);

            if (result.rows.length === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
            }

            const rol = result.rows[0].nombre_rol;

            if (!rolesPermitidos.includes(rol)) {
                return res.status(403).json({ mensaje: `Acceso prohibido. Se requieren uno de los siguientes roles: ${rolesPermitidos.join(', ')}.` });
            }

            // Guardamos el rol en el req por si los controladores lo necesitan
            req.usuario = { id: idUsuario, rol: rol };
            next();
        } catch (error) {
            console.error('Error en middleware verificarRoles:', error);
            res.status(500).json({ mensaje: 'Error al verificar permisos.' });
        }
    };
};

const verificarAdmin = verificarRoles(['admin']);

module.exports = { verificarAdmin, verificarRoles };