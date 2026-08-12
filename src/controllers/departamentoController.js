const Departamento = require('../models/Departamento');

// GET /api/departamentos - listar todos, con su división poblada
async function listarDepartamentos(req, res) {
  try {
    const departamentos = await Departamento.find()
      .populate('division')
      .sort({ codigo: 1 });
    res.json(departamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// GET /api/departamentos/:id
async function obtenerDepartamento(req, res) {
  try {
    const departamento = await Departamento.findById(req.params.id)
      .populate('division', 'codigo nombre')
      .populate('categorias', 'codigo nombre')
      .populate('centros', 'codigo nombre');
    if (!departamento) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }
    res.json(departamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// POST /api/departamentos
const crearDepartamento = async (req, res) => {
  try {
    const { codigo, nombre, division, categorias = [], centros = [] } = req.body;
    const nuevo = await Departamento.create({ codigo, nombre, division, categorias, centros });
    const poblado = await Departamento.findById(nuevo._id)
      .populate('division', 'codigo nombre')
      .populate('categorias', 'codigo nombre')
      .populate('centros', 'codigo nombre');
    res.status(201).json(poblado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un departamento con ese código' });
    }
    res.status(400).json({ mensaje: error.message });
  }
};
// PUT /api/departamentos/:id
const actualizarDepartamento = async (req, res) => {
  try {
    const { codigo, nombre, division, categorias, centros } = req.body;
    const cambios = {};
    if (codigo !== undefined) cambios.codigo = codigo;
    if (nombre !== undefined) cambios.nombre = nombre;
    if (division !== undefined) cambios.division = division;
    if (categorias !== undefined) cambios.categorias = categorias;
    if (centros !== undefined) cambios.centros = centros;

    const actualizado = await Departamento.findByIdAndUpdate(
      req.params.id, cambios, { new: true, runValidators: true }
    )
      .populate('division', 'codigo nombre')
      .populate('categorias', 'codigo nombre')
      .populate('centros', 'codigo nombre');

    if (!actualizado) return res.status(404).json({ mensaje: 'Departamento no encontrado' });
    res.json(actualizado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un departamento con ese código' });
    }
    res.status(400).json({ mensaje: error.message });
  }
};
// DELETE /api/departamentos/:id
const eliminarDepartamento = async (req, res) => {
  try {
    const ConsumoInsumo = require('../models/ConsumoInsumo');
    const usados = await ConsumoInsumo.countDocuments({ departamento: req.params.id });
    if (usados > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar: tiene ${usados} consumo(s) registrado(s).`
      });
    }
    const eliminado = await Departamento.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Departamento no encontrado' });
    res.json({ mensaje: 'Departamento eliminado', departamento: eliminado });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = {
  listarDepartamentos,
  obtenerDepartamento,
  crearDepartamento,
  actualizarDepartamento,
  eliminarDepartamento
};