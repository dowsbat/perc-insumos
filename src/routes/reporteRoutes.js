const express = require('express');
const router = express.Router();
const { avanceDepartamentos, avanceCentros } = require('../controllers/reporteController');

router.get('/avance', avanceDepartamentos);
router.get('/avance/:departamentoId', avanceCentros);

module.exports = router;