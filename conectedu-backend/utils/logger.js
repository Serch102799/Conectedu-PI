// Archivo: helpers/logger.js
const pool = require('../db');

const registrarLog = async (id_usuario, accion, tabla, detalle) => {
    try {
        await pool.query(
            `INSERT INTO logs_sistema (id_usuario_accion, accion, tabla_afectada, detalle) 
             VALUES ($1, $2, $3, $4)`,
            [id_usuario, accion, tabla, detalle]
        );
    } catch (error) {
        console.error('Error al guardar log en BD:', error);
    }
};

module.exports = { registrarLog };