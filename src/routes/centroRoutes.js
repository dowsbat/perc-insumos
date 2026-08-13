const express = require('express');
const router = express.Router();
const {
  listarCentros,
  obtenerCentro,
  crearCentro,
  actualizarCentro,
  eliminarCentro
} = require('../controllers/centroController');

router.get('/', listarCentros);
router.post('/', crearCentro);
router.get('/:id', obtenerCentro);
router.put('/:id', actualizarCentro);
router.delete('/:id', eliminarCentro);

module.exports = router;