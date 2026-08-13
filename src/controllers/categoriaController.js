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

// POST /api/categorias
async function crearCategoria(req, res) {
  try {
    const { codigo, nombre, areaEncargada = '' } = req.body;
    if (!codigo?.trim() || !nombre?.trim()) {
      return res.status(400).json({ mensaje: 'Código y nombre son obligatorios' });
    }
    const nueva = await CategoriaInsumo.create({
      codigo: codigo.trim(), nombre: nombre.trim(), areaEncargada: areaEncargada.trim()
    });
    res.status(201).json(nueva);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese código' });
    }
    res.status(400).json({ mensaje: error.message });
  }
}

// PUT /api/categorias/:id
async function actualizarCategoria(req, res) {
  try {
    const { codigo, nombre, areaEncargada } = req.body;
    const cambios = {};
    if (codigo !== undefined) cambios.codigo = codigo.trim();
    if (nombre !== undefined) cambios.nombre = nombre.trim();
    if (areaEncargada !== undefined) cambios.areaEncargada = areaEncargada.trim();

    const actualizada = await CategoriaInsumo.findByIdAndUpdate(
      req.params.id, cambios, { new: true, runValidators: true }
    );
    if (!actualizada) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json(actualizada);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese código' });
    }
    res.status(400).json({ mensaje: error.message });
  }
}

// DELETE /api/categorias/:id
async function eliminarCategoria(req, res) {
  try {
    const ConsumoInsumo = require('../models/ConsumoInsumo');
    const Departamento = require('../models/Departamento');

    const usados = await ConsumoInsumo.countDocuments({ categoria: req.params.id });
    if (usados > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar: tiene ${usados} consumo(s) registrado(s).`
      });
    }

    // Sin consumos: la quitamos de los departamentos que la tengan asignada
    await Departamento.updateMany(
      { categorias: req.params.id },
      { $pull: { categorias: req.params.id } }
    );

    const eliminada = await CategoriaInsumo.findByIdAndDelete(req.params.id);
    if (!eliminada) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada', categoria: eliminada });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}


module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};