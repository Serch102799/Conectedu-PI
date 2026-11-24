const { Router } = require('express');
const router = Router();
const { getNotificaciones, marcarLeida } = require('../controllers/notificaciones.controller');

// No usamos verificarRoles estricto aquí porque todos los usuarios pueden ver sus propias notificaciones
// Pero sí podríamos requerir que esté autenticado (que envíe usuario-id)
// Por ahora, el controlador valida que venga el usuario-id.

router.get('/', getNotificaciones);
router.put('/:id_notificacion/leida', marcarLeida);

module.exports = router;
