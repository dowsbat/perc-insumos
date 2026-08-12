const CentroProduccion = require('../models/CentroProduccion');

async function listarCentros(req, res) {
  try {
    const centros = await CentroProduccion.find().sort({ orden: 1 });
    res.json(centros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerCentro(req, res) {
  try {
    const centro = await CentroProduccion.findById(req.params.id);
    if (!centro) {
      return res.status(404).json({ error: 'Centro no encontrado' });
    }
    res.json(centro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { listarCentros, obtenerCentro };