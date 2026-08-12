const express = require('express');
const router = express.Router();
const { listarDivisiones, obtenerDivision } = require('../controllers/divisionController');

// GET /api/divisiones
router.get('/', listarDivisiones);

// GET /api/divisiones/:id
router.get('/:id', obtenerDivision);

module.exports = router;