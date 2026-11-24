const pool = require('../db');
const { registrarLog } = require('../utils/logger');


// Función para consultar a la IA de CONECTEDU
async function predecirRiesgoEstudiante(datosAlumno) {
    try {
        const urlIA = 'https://conectedu-ai-service.onrender.com'; // Reemplaza con tu URL de Render

        const response = await fetch(urlIA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                perfil_vak: datosAlumno.perfil_vak,
                dias_inactivos: datosAlumno.dias_inactivos,
                racha_actual: datosAlumno.racha_actual,
                promedio_calificaciones: datosAlumno.promedio,
                tutorias_asistidas: datosAlumno.tutorias
            })
        });

        const resultado = await response.json();
        console.log("Respuesta de la IA:", resultado.mensaje);
        return resultado.riesgo_alto; // Devuelve true o false
    } catch (error) {
        console.error("Error conectando con el servicio de IA:", error);
        return false; // Fallback por seguridad
    }
}
// 1. Obtener todos los usuarios (GET)
const getUsuarios = async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT u.id_usuario, u.nombre_completo, u.email, r.nombre_rol, u.fecha_registro, u.estado, u.estilo_vak
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY u.id_usuario ASC
        `);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// 2. Crear un nuevo usuario (POST)
const createUsuario = async (req, res) => {
    const { id_rol, nombre_completo, email, password } = req.body;
    const idAdmin = req.header('usuario-id'); // Quién realiza la acción

    try {
        // Validamos duplicados
        const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }

        const response = await pool.query(
            `INSERT INTO usuarios (id_rol, nombre_completo, email, password_hash, estado) 
             VALUES ($1, $2, $3, $4, 'activo') RETURNING id_usuario, nombre_completo, email`,
            [id_rol, nombre_completo, email, password]
        );

        const nuevoUsuario = response.rows[0];

        // REGISTRO DE LOG
        await registrarLog(
            idAdmin,
            'CREAR',
            'usuarios',
            `Se creó el usuario: ${nuevoUsuario.nombre_completo} (${nuevoUsuario.email}) con rol ID: ${id_rol}`
        );

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: nuevoUsuario
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al insertar en la base de datos' });
    }
};

// 3. Actualizar un usuario (PUT)
const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { id_rol, nombre_completo, email } = req.body;
    const idAdmin = req.header('usuario-id');

    try {
        const result = await pool.query(
            `UPDATE usuarios 
             SET id_rol = $1, nombre_completo = $2, email = $3 
             WHERE id_usuario = $4 RETURNING id_usuario, nombre_completo, email`,
            [id_rol, nombre_completo, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        const usuarioEditado = result.rows[0];

        // REGISTRO DE LOG
        await registrarLog(
            idAdmin,
            'ACTUALIZAR',
            'usuarios',
            `Se actualizaron datos del usuario ID: ${id}. Nuevo nombre: ${usuarioEditado.nombre_completo}`
        );

        res.json({ mensaje: 'Usuario actualizado correctamente.', usuario: usuarioEditado });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ mensaje: 'Error al actualizar en la base de datos.' });
    }
};

// 4. Eliminar un usuario (DELETE)
const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    const idAdmin = req.header('usuario-id');

    try {
        // Obtenemos datos antes de borrar para el log
        const userData = await pool.query('SELECT email FROM usuarios WHERE id_usuario = $1', [id]);

        const result = await pool.query(
            'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // REGISTRO DE LOG
        await registrarLog(
            idAdmin,
            'ELIMINAR',
            'usuarios',
            `Se eliminó permanentemente al usuario ID: ${id} con email: ${userData.rows[0].email}`
        );

        res.json({ mensaje: 'Usuario eliminado permanentemente del sistema.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar en la base de datos. Verifique si tiene registros asociados.' });
    }
};

// 5. Obtener solo Tutores (Catálogo filtrado)
const getTutores = async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT id_usuario, nombre_completo 
            FROM usuarios 
            WHERE id_rol = 2 
            ORDER BY nombre_completo ASC
        `);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error al obtener tutores:', error);
        res.status(500).json({ mensaje: 'Error al obtener la lista de tutores' });
    }
};

// 7. Aprobar Usuario (PUT)
const aprobarUsuario = async (req, res) => {
    const { id } = req.params;
    const idAdmin = req.header('usuario-id');

    try {
        const result = await pool.query(
            `UPDATE usuarios SET estado = 'activo' WHERE id_usuario = $1 RETURNING id_usuario, nombre_completo`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        const usuarioAprobado = result.rows[0];

        // REGISTRO DE LOG
        await registrarLog(
            idAdmin,
            'APROBAR',
            'usuarios',
            `Se aprobó la solicitud de registro del usuario: ${usuarioAprobado.nombre_completo} (ID: ${id})`
        );

        res.json({ mensaje: 'Usuario aprobado correctamente.', usuario: usuarioAprobado });
    } catch (error) {
        console.error('Error al aprobar usuario:', error);
        res.status(500).json({ mensaje: 'Error al aprobar en la base de datos.' });
    }
};
const { performance } = require('perf_hooks');

const evaluarRiesgo = async (req, res) => {
    const { id } = req.params; // ID del alumno

    try {
        // 1. Obtener los datos reales del alumno desde la Base de Datos
        const query = `
            SELECT 
                COALESCE(u.estilo_vak, 'Visual') AS perfil_vak,
                COALESCE(u.racha_actual, 0) AS racha_actual,
                COALESCE((CURRENT_DATE - u.ultima_actividad)::INT, 0) AS dias_inactivos,
                COALESCE((
                    SELECT AVG(calificacion)::NUMERIC(5,2) 
                    FROM resultados_evaluacion 
                    WHERE id_estudiante = u.id_usuario
                ), 0) AS promedio,
                (
                    SELECT COUNT(*)::INT 
                    FROM citas_tutorias 
                    WHERE id_estudiante = u.id_usuario 
                    AND LOWER(estado) = 'completada'
                ) AS tutorias
            FROM usuarios u
            WHERE u.id_usuario = $1
        `;

        const dbResult = await pool.query(query, [id]);

        if (dbResult.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado en la base de datos.' });
        }

        const datosDelAlumno = dbResult.rows[0];

        datosDelAlumno.promedio = parseFloat(datosDelAlumno.promedio);
        datosDelAlumno.tutorias = parseInt(datosDelAlumno.tutorias, 10);
        datosDelAlumno.racha_actual = parseInt(datosDelAlumno.racha_actual, 10);
        datosDelAlumno.dias_inactivos = Math.max(0, parseInt(datosDelAlumno.dias_inactivos, 10));

        if (datosDelAlumno.perfil_vak === 'Por definir') {
            datosDelAlumno.perfil_vak = 'Kinestésico';
        }
        const tiempoInicio = performance.now();

        const urlIA = 'http://127.0.0.1:8000/predecir';
        const response = await fetch(urlIA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                perfil_vak: datosDelAlumno.perfil_vak,
                dias_inactivos: datosDelAlumno.dias_inactivos,
                racha_actual: datosDelAlumno.racha_actual,
                promedio_calificaciones: datosDelAlumno.promedio,
                tutorias_asistidas: datosDelAlumno.tutorias
            })
        });

        const resultado = await response.json();

        const tiempoFin = performance.now();
        const tiempoEjecucion = Math.round(tiempoFin - tiempoInicio);

        await pool.query(
            `INSERT INTO predicciones_desercion (id_empleado, riesgo_alto, probabilidad, tiempo_ejecucion_ms)
             VALUES ($1, $2, $3, $4)`,
            [id, resultado.riesgo_alto, resultado.probabilidad, tiempoEjecucion]
        );

        res.status(200).json({
            interfaz_acceso: urlIA,
            modelo_prediccion: "Random Forest Classifier",
            resultado: {
                riesgo_alto: resultado.riesgo_alto,
                probabilidad: resultado.probabilidad,
                mensaje: resultado.mensaje
            },
            datos_alumno: datosDelAlumno,
            metricas_analisis: {
                exactitud: "95.00%",
                precision: "98.00%",
                recall: "84.48%",
                f1_score: "90.74%",
                auc_roc: "0.9907"
            },
            tiempo_ejecucion_ms: tiempoEjecucion
        });

    } catch (error) {
        console.error('Error en la evaluación predictiva:', error);
        res.status(500).json({ mensaje: 'Error al procesar el modelo de predicción.' });
    }
};
const getDashboardEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                u.racha_actual,
                u.estilo_vak,
                COALESCE((SELECT AVG(porcentaje_avance) FROM inscripciones WHERE id_estudiante = u.id_usuario), 0) as progreso_general,
                COALESCE((SELECT AVG(calificacion) FROM resultados_evaluacion WHERE id_estudiante = u.id_usuario), 0) as promedio_calificaciones,
                (SELECT COUNT(*) FROM citas_tutorias WHERE id_estudiante = u.id_usuario AND estado = 'Pendiente') as citas_pendientes
            FROM usuarios u
            WHERE u.id_usuario = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        const data = result.rows[0];

        res.json({
            progresoGeneral: Math.round(data.progreso_general),
            rachaActual: parseInt(data.racha_actual, 10),
            promedio: parseFloat(data.promedio_calificaciones),
            citasPendientes: parseInt(data.citas_pendientes, 10),
            estiloVak: data.estilo_vak
        });
    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({ mensaje: 'Error al obtener datos del dashboard' });
    }
};

module.exports = {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    evaluarRiesgo,
    getTutores,
    aprobarUsuario,
    getDashboardEstudiante
};