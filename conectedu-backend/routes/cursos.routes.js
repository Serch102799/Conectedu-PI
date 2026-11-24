const { Router } = require('express');
const router = Router();
const { getCursos, createCurso, updateCurso, deleteCurso } = require('../controllers/cursos.controller');
const { verificarAdmin, verificarRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarRoles(['admin', 'tutor', 'estudiante']), getCursos);
router.post('/', verificarAdmin, createCurso);
router.put('/:id', verificarAdmin, updateCurso);
router.delete('/:id', verificarAdmin, deleteCurso);

module.exports = router;