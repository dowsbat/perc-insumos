const express = require('express');                          // framework web
const router = express.Router();                             // mini-enrutador de este módulo
const { exportarDepartamento } = require('../controllers/exportController'); // la función del controller

// GET /api/export/departamento/:id?periodo=AAAA-MM  -> descarga el Excel
router.get('/departamento/:id', exportarDepartamento);       // ruta de exportación por departamento

module.exports = router;                                      // exportamos el enrutador