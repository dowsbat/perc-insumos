const Division = require('../models/Division');

// GET /api/divisiones - listar todas las divisiones
async function listarDivisiones(req, res) {
  try {
    const divisiones = await Division.find().sort({ codigo: 1 });
    res.json(divisiones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/divisiones/:id - obtener una división por su id
async function obtenerDivision(req, res) {
  try {
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ error: 'División no encontrada' });
    }
    res.json(division);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listarDivisiones,
  obtenerDivision
};