const express = require('express');
const router = express.Router();
const { listarCentros, obtenerCentro } = require('../controllers/centroController');

router.get('/', listarCentros);
router.get('/:id', obtenerCentro);

module.exports = router;