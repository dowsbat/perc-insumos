const express = require('express');
const router = express.Router();
const {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoriaController');

router.get('/', listarCategorias);
router.post('/', crearCategoria);
router.get('/:id', obtenerCategoria);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;