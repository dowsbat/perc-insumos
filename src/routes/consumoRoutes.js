const express = require('express');
const router = express.Router();
const {
  crearConsumo,
  listarConsumos,
  obtenerConsumo,
  actualizarConsumo,
  eliminarConsumo
} = require('../controllers/consumoController');

router.get('/', listarConsumos);
router.post('/', crearConsumo);
router.get('/:id', obtenerConsumo);
router.put('/:id', actualizarConsumo);
router.delete('/:id', eliminarConsumo);

module.exports = router;