const express = require('express');
const router = express.Router();
const {
  listarDepartamentos,
  obtenerDepartamento,
  crearDepartamento,
  actualizarDepartamento,
  eliminarDepartamento
} = require('../controllers/departamentoController');

router.get('/', listarDepartamentos);
router.post('/', crearDepartamento);
router.get('/:id', obtenerDepartamento);
router.put('/:id', actualizarDepartamento);
router.delete('/:id', eliminarDepartamento);

module.exports = router;