const express = require('express');
const router = express.Router();
const { listarCategorias, obtenerCategoria } = require('../controllers/categoriaController');

router.get('/', listarCategorias);
router.get('/:id', obtenerCategoria);

module.exports = router;