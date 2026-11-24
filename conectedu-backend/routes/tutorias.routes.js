const { Router } = require('express');
const router = Router();
const { 
    getTutoresTarjetas, 
    actualizarPerfilTutor, 
    getDisponibilidadTutor,
    agregarHorario,
    eliminarHorario,
    agendarCita,
    getMisCitas,
    cambiarEstadoCita
} = require('../controllers/tutorias.controller');
const { verificarRoles } = require('../middlewares/auth.middleware');

// Rutas de visualización general
router.get('/publicos', verificarRoles(['admin', 'tutor', 'estudiante']), getTutoresTarjetas);
router.get('/disponibilidad/:id_tutor', verificarRoles(['admin', 'tutor', 'estudiante']), getDisponibilidadTutor);

// Rutas exclusivas del panel del Tutor
router.post('/mi-perfil', verificarRoles(['admin', 'tutor']), actualizarPerfilTutor);
router.post('/horarios', verificarRoles(['admin', 'tutor']), agregarHorario);
router.delete('/horarios/:id_disponibilidad', verificarRoles(['admin', 'tutor']), eliminarHorario);

// Rutas para Agendar y Gestionar Citas (Compartidas entre Estudiante y Tutor)
router.post('/citas', verificarRoles(['admin', 'tutor', 'estudiante']), agendarCita);
router.get('/mis-citas', verificarRoles(['admin', 'tutor', 'estudiante']), getMisCitas);
router.put('/citas/:id_cita/estado', verificarRoles(['admin', 'tutor', 'estudiante']), cambiarEstadoCita);

module.exports = router;