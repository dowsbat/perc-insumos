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
// POST /api/centros
async function crearCentro(req, res) {
  try {
    const { codigo, nombre, tipo = 'final', orden = 999, subdivisiones = [] } = req.body;
    if (!codigo?.trim() || !nombre?.trim()) {
      return res.status(400).json({ mensaje: 'Código y nombre son obligatorios' });
    }
    const subs = (subdivisiones || [])
      .map(s => ({ nombre: (typeof s === 'string' ? s : s.nombre || '').trim() }))
      .filter(s => s.nombre);

    const nuevo = await CentroProduccion.create({
      codigo: codigo.trim(), nombre: nombre.trim(), tipo, orden: Number(orden) || 999,
      subdivisiones: subs
    });
    res.status(201).json(nuevo);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un centro con ese código' });
    }
    res.status(400).json({ mensaje: error.message });
  }
}
// PUT /api/centros/:id
async function actualizarCentro(req, res) {
  try {
    const { codigo, nombre, tipo, orden, subdivisiones } = req.body;
    const cambios = {};
    if (codigo !== undefined) cambios.codigo = codigo.trim();
    if (nombre !== undefined) cambios.nombre = nombre.trim();
    if (tipo !== undefined) cambios.tipo = tipo;
    if (orden !== undefined) cambios.orden = Number(orden) || 999;
    if (subdivisiones !== undefined) {
      cambios.subdivisiones = (subdivisiones || [])
        .map(s => ({ nombre: (typeof s === 'string' ? s : s.nombre || '').trim() }))
        .filter(s => s.nombre);
    }

    const actualizado = await CentroProduccion.findByIdAndUpdate(
      req.params.id, cambios, { new: true, runValidators: true }
    );
    if (!actualizado) return res.status(404).json({ mensaje: 'Centro no encontrado' });
    res.json(actualizado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un centro con ese código' });
    }
    res.status(400).json({ mensaje: error.message });
  }
}
// DELETE /api/centros/:id
async function eliminarCentro(req, res) {
  try {
    const ConsumoInsumo = require('../models/ConsumoInsumo');
    const Departamento = require('../models/Departamento');

    const usados = await ConsumoInsumo.countDocuments({ centro: req.params.id });
    if (usados > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar: tiene ${usados} consumo(s) registrado(s).`
      });
    }

    await Departamento.updateMany(
      { centros: req.params.id },
      { $pull: { centros: req.params.id } }
    );

    const eliminado = await CentroProduccion.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Centro no encontrado' });
    res.json({ mensaje: 'Centro eliminado', centro: eliminado });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = {
  listarCentros,
  obtenerCentro,
  crearCentro,
  actualizarCentro,
  eliminarCentro
};