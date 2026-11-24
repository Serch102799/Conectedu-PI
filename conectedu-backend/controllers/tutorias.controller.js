const pool = require('../db');
const { registrarLog } = require('../utils/logger');
const { enviarCorreo } = require('../utils/mailer');
const { crearNotificacion } = require('./notificaciones.controller');

// 1. Obtener todos los tutores para las TARJETAS del alumno
const getTutoresTarjetas = async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.nombre_completo, u.email, 
                   p.biografia, p.especialidad, p.enlace_reunion
            FROM usuarios u
            LEFT JOIN perfiles_tutores p ON u.id_usuario = p.id_tutor
            WHERE u.id_rol = 2 -- Solo traemos a los que son tutores
            ORDER BY u.nombre_completo ASC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener tutores:', error);
        res.status(500).json({ mensaje: 'Error al cargar el catálogo de tutores' });
    }
};

const actualizarPerfilTutor = async (req, res) => {
    const { biografia, especialidad, enlace_reunion } = req.body;
    const idTutor = req.header('usuario-id'); 

    try {
        const query = `
            INSERT INTO perfiles_tutores (id_tutor, biografia, especialidad, enlace_reunion)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id_tutor) 
            DO UPDATE SET 
                biografia = EXCLUDED.biografia, 
                especialidad = EXCLUDED.especialidad,
                enlace_reunion = EXCLUDED.enlace_reunion
            RETURNING *;
        `;
        
        const result = await pool.query(query, [idTutor, biografia, especialidad, enlace_reunion]);
        
        await registrarLog(idTutor, 'ACTUALIZAR_PERFIL', 'perfiles_tutores', `El tutor ID ${idTutor} actualizó su información pública`);
        
        res.status(200).json({ mensaje: 'Perfil actualizado exitosamente', perfil: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ mensaje: 'Hubo un error al guardar tu perfil' });
    }
};

const getDisponibilidadTutor = async (req, res) => {
    const { id_tutor } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM disponibilidad_tutores 
             WHERE id_tutor = $1 
             ORDER BY dia_semana, hora_inicio`,
            [id_tutor]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        res.status(500).json({ mensaje: 'Error al consultar la disponibilidad' });
    }
};
// 4. El Tutor agrega un nuevo horario a su agenda
const agregarHorario = async (req, res) => {
    const { dia_semana, hora_inicio, hora_fin } = req.body;
    const idTutor = req.header('usuario-id'); // Quién está logueado

    try {
        const query = `
            INSERT INTO disponibilidad_tutores (id_tutor, dia_semana, hora_inicio, hora_fin)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const result = await pool.query(query, [idTutor, dia_semana, hora_inicio, hora_fin]);
        
        await registrarLog(idTutor, 'AGREGAR_HORARIO', 'disponibilidad_tutores', `Tutor ID ${idTutor} agregó horario el ${dia_semana}`);
        
        res.status(201).json({ mensaje: 'Horario agregado', horario: result.rows[0] });
    } catch (error) {
        console.error('Error al agregar horario:', error);
        res.status(500).json({ mensaje: 'Error al guardar tu disponibilidad' });
    }
};

// 5. El Tutor elimina un horario que ya no le acomoda
const eliminarHorario = async (req, res) => {
    const { id_disponibilidad } = req.params;
    const idTutor = req.header('usuario-id');

    try {
        // Aseguramos que solo el dueño del horario pueda borrarlo
        const result = await pool.query(
            'DELETE FROM disponibilidad_tutores WHERE id_disponibilidad = $1 AND id_tutor = $2 RETURNING *',
            [id_disponibilidad, idTutor]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Horario no encontrado o no tienes permiso.' });
        }

        await registrarLog(idTutor, 'ELIMINAR_HORARIO', 'disponibilidad_tutores', `Tutor ID ${idTutor} eliminó un horario`);
        
        res.status(200).json({ mensaje: 'Horario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar horario:', error);
        res.status(500).json({ mensaje: 'Error al intentar borrar el horario' });
    }
};

const agendarCita = async (req, res) => {
    const { id_tutor, fecha_cita, hora_inicio, hora_fin, tema_duda } = req.body;
    const idEstudiante = req.header('usuario-id'); 

    try {
        const ocupado = await pool.query(`
            SELECT * FROM citas_tutorias 
            WHERE id_tutor = $1 AND fecha_cita = $2 AND hora_inicio = $3 AND estado != 'Cancelada'
        `, [id_tutor, fecha_cita, hora_inicio]);

        if (ocupado.rows.length > 0) {
            return res.status(400).json({ mensaje: 'Este horario ya fue reservado.' });
        }
        const query = `
            INSERT INTO citas_tutorias (id_estudiante, id_tutor, fecha_cita, hora_inicio, hora_fin, tema_duda)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const result = await pool.query(query, [idEstudiante, id_tutor, fecha_cita, hora_inicio, hora_fin, tema_duda]);

        const infoUsuarios = await pool.query(`
            SELECT 
                (SELECT nombre_completo FROM usuarios WHERE id_usuario = $1) as alumno,
                (SELECT email FROM usuarios WHERE id_usuario = $2) as correo_tutor
        `, [idEstudiante, id_tutor]);

        const nombreAlumno = infoUsuarios.rows[0].alumno;
        const correoTutor = infoUsuarios.rows[0].correo_tutor;

        const asunto = `📅 Nueva Tutoría Agendada: ${fecha_cita}`;
        const mensajeHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #004b93;">¡Tienes una nueva tutoría programada!</h2>
                <p>Hola, el estudiante <strong>${nombreAlumno}</strong> ha agendado una asesoría contigo.</p>
                <ul>
                    <li><strong>Fecha:</strong> ${fecha_cita}</li>
                    <li><strong>Horario:</strong> ${hora_inicio} a ${hora_fin}</li>
                    <li><strong>Tema a revisar:</strong> ${tema_duda}</li>
                </ul>
                <p>Por favor, ingresa a la plataforma CONECTEDU para confirmar o gestionar esta cita.</p>
            </div>
        `;
        enviarCorreo(correoTutor, asunto, mensajeHTML);

        await registrarLog(idEstudiante, 'AGENDAR_CITA', 'citas_tutorias', `Cita agendada con Tutor ID ${id_tutor}`);
        
        // **NUEVA FUNCIONALIDAD: Notificación a BD**
        await crearNotificacion(
            id_tutor, 
            `El estudiante ${nombreAlumno} ha agendado una cita el ${fecha_cita}`, 
            'alerta', 
            '/plataforma/mis-citas'
        );

        res.status(201).json({ mensaje: '¡Tutoría agendada con éxito!', cita: result.rows[0] });
    } catch (error) {
        console.error('Error al agendar cita:', error);
        res.status(500).json({ mensaje: 'No pudimos agendar tu cita.' });
    }
};
// 7. Obtener "Mis Citas" (Sirve tanto para el alumno como para el maestro)
const getMisCitas = async (req, res) => {
    const miId = req.header('usuario-id');
    try {
        // Traemos las citas y cruzamos datos para saber el nombre de la otra persona
        const result = await pool.query(`
            SELECT c.*, 
                   est.nombre_completo AS nombre_estudiante, est.email AS correo_estudiante,
                   tut.nombre_completo AS nombre_tutor, p.enlace_reunion
            FROM citas_tutorias c
            JOIN usuarios est ON c.id_estudiante = est.id_usuario
            JOIN usuarios tut ON c.id_tutor = tut.id_usuario
            LEFT JOIN perfiles_tutores p ON tut.id_usuario = p.id_tutor
            WHERE c.id_estudiante = $1 OR c.id_tutor = $1
            ORDER BY c.fecha_cita DESC, c.hora_inicio ASC
        `, [miId]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener tus citas' });
    }
};

// 8. Cambiar el estado de la cita (Aceptar, Completar, Cancelar)
const cambiarEstadoCita = async (req, res) => {
    const { id_cita } = req.params;
    const { estado } = req.body; // 'Aceptada', 'Completada', 'Cancelada'
    const idUsuario = req.header('usuario-id');

    try {
        const result = await pool.query(
            "UPDATE citas_tutorias SET estado = $1 WHERE id_cita = $2 RETURNING *",
            [estado, id_cita]
        );
        
        const cita = result.rows[0];
        
        // Notificar a la otra parte (Si yo soy el tutor, notifico al estudiante y viceversa)
        if (cita) {
            const idDestino = (String(cita.id_tutor) === String(idUsuario)) ? cita.id_estudiante : cita.id_tutor;
            const tipoNotif = estado === 'Cancelada' ? 'alerta' : 'exito';
            await crearNotificacion(
                idDestino, 
                `El estado de tu cita ha cambiado a: ${estado}`, 
                tipoNotif, 
                '/plataforma/mis-citas'
            );
        }

        res.status(200).json({ mensaje: `Cita marcada como ${estado}`, cita });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cambiar el estado de la cita' });
    }
};

module.exports = {
    getTutoresTarjetas,
    actualizarPerfilTutor,
    getDisponibilidadTutor,
    getTutoresTarjetas,
    actualizarPerfilTutor,
    getDisponibilidadTutor,
    agregarHorario,
    eliminarHorario,
    agendarCita,
    getMisCitas,
    cambiarEstadoCita
};