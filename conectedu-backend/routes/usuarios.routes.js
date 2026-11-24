const { Router } = require('express');
const router = Router();
const { evaluarRiesgo } = require('../controllers/usuarios.controller');

// 1. Importamos TODAS las funciones necesarias del controlador en una sola línea
const { 
    getUsuarios, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    getTutores,
    aprobarUsuario,
    getDashboardEstudiante
} = require('../controllers/usuarios.controller');

const { verificarAdmin, verificarRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarAdmin, getUsuarios);
router.post('/', verificarAdmin, createUsuario);
router.get('/tutores', verificarAdmin, getTutores); 
router.put('/:id', verificarAdmin, updateUsuario);
router.put('/:id/aprobar', verificarAdmin, aprobarUsuario);
router.delete('/:id', verificarAdmin, deleteUsuario);
router.post('/evaluar-riesgo/:id', verificarAdmin, evaluarRiesgo);
// Ruta para el dashboard (se puede acceder con el rol de estudiante, por ende no usamos verificarAdmin aquí)
router.get('/:id/dashboard-stats', getDashboardEstudiante);
module.exports = router;