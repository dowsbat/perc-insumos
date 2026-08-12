const CategoriaInsumo = require('../models/CategoriaInsumo');

async function listarCategorias(req, res) {
  try {
    const categorias = await CategoriaInsumo.find().sort({ codigo: 1 });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerCategoria(req, res) {
  try {
    const categoria = await CategoriaInsumo.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { listarCategorias, obtenerCategoria };