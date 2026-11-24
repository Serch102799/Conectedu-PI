const pool = require('../db');

const getLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.id_log, u.nombre_completo AS usuario, l.accion, l.tabla_afectada, l.detalle, l.fecha_hora
            FROM logs_sistema l
            LEFT JOIN usuarios u ON l.id_usuario_accion = u.id_usuario
            ORDER BY l.fecha_hora DESC
            LIMIT 100
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los logs:', error);
        res.status(500).json({ mensaje: 'Error al obtener el registro de actividad.' });
    }
};

module.exports = { getLogs };