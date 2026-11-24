const pool = require('../db');

const getCursos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id_curso, c.nombre, c.descripcion, c.estado, u.nombre_completo AS tutor
            FROM cursos c
            LEFT JOIN usuarios u ON c.id_tutor = u.id_usuario
            ORDER BY c.id_curso ASC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los cursos.' });
    }
};

const createCurso = async (req, res) => {
    const { nombre, descripcion, id_tutor } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO cursos (nombre, descripcion, id_tutor) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nombre, descripcion, id_tutor || null] // null si no le asignan tutor aún
        );
        res.status(201).json({ mensaje: 'Curso creado', curso: result.rows[0] });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el curso.' });
    }
};

const updateCurso = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, id_tutor, estado } = req.body;
    try {
        const result = await pool.query(
            `UPDATE cursos SET nombre = $1, descripcion = $2, id_tutor = $3, estado = $4 
             WHERE id_curso = $5 RETURNING *`,
            [nombre, descripcion, id_tutor || null, estado, id]
        );
        res.json({ mensaje: 'Curso actualizado', curso: result.rows[0] });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el curso.' });
    }
};

const deleteCurso = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cursos WHERE id_curso = $1', [id]);
        res.json({ mensaje: 'Curso eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar. Verifica que no tenga alumnos inscritos.' });
    }
};

module.exports = { getCursos, createCurso, updateCurso, deleteCurso };