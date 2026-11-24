const pool = require('../db');

// Obtener notificaciones de un usuario
const getNotificaciones = async (req, res) => {
    try {
        const idUsuario = req.header('usuario-id');
        if (!idUsuario) return res.status(401).json({ mensaje: 'No autorizado' });

        const result = await pool.query(`
            SELECT * FROM notificaciones
            WHERE id_usuario = $1
            ORDER BY fecha_creacion DESC
            LIMIT 20
        `, [idUsuario]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
    }
};

// Marcar notificación como leída
const marcarLeida = async (req, res) => {
    try {
        const idUsuario = req.header('usuario-id');
        const { id_notificacion } = req.params;

        await pool.query(`
            UPDATE notificaciones
            SET leida = TRUE
            WHERE id_notificacion = $1 AND id_usuario = $2
        `, [id_notificacion, idUsuario]);

        res.json({ mensaje: 'Notificación leída' });
    } catch (error) {
        console.error('Error al marcar leída:', error);
        res.status(500).json({ mensaje: 'Error interno' });
    }
};

// Función auxiliar para insertar notificación desde otros controladores
const crearNotificacion = async (idUsuario, mensaje, tipo = 'info', enlace = null) => {
    try {
        await pool.query(`
            INSERT INTO notificaciones (id_usuario, mensaje, tipo, enlace)
            VALUES ($1, $2, $3, $4)
        `, [idUsuario, mensaje, tipo, enlace]);
    } catch (error) {
        console.error('Error al crear notificación interna:', error);
    }
};

module.exports = {
    getNotificaciones,
    marcarLeida,
    crearNotificacion
};
