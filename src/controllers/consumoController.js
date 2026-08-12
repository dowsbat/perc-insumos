const ConsumoInsumo = require('../models/ConsumoInsumo');

// POST /api/consumos - crear o actualizar un consumo (upsert)
async function crearConsumo(req, res) {
  try {
    const { departamento, centro, subdivision, categoria, periodo, monto } = req.body;

    // Validación mínima de campos obligatorios
    if (!departamento || !centro || !categoria || !periodo || monto === undefined) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: departamento, centro, categoria, periodo, monto'
      });
    }

    // La "llave" de la celda (los 5 campos del índice único)
    const filtro = {
      departamento,
      centro,
      subdivision: subdivision || null,
      categoria,
      periodo
    };

    // Upsert: si la celda existe, actualiza el monto; si no, la crea
    const consumo = await ConsumoInsumo.findOneAndUpdate(
      filtro,
      { $set: { monto } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(consumo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/consumos - listar con filtros opcionales
async function listarConsumos(req, res) {
  try {
    const { periodo, departamento, centro, categoria } = req.query;

    // Armar el filtro dinámicamente según lo que venga en la URL
    const filtro = {};
    if (periodo) filtro.periodo = periodo;
    if (departamento) filtro.departamento = departamento;
    if (centro) filtro.centro = centro;
    if (categoria) filtro.categoria = categoria;

    const consumos = await ConsumoInsumo.find(filtro)
      .populate('departamento', 'codigo nombre')
      .populate('centro', 'codigo nombre')
      .populate('categoria', 'codigo nombre')
      .sort({ periodo: -1 });

    res.json({
      total: consumos.length,
      consumos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/consumos/:id - obtener un consumo puntual
async function obtenerConsumo(req, res) {
  try {
    const consumo = await ConsumoInsumo.findById(req.params.id)
      .populate('departamento', 'codigo nombre')
      .populate('centro', 'codigo nombre')
      .populate('categoria', 'codigo nombre');

    if (!consumo) {
      return res.status(404).json({ error: 'Consumo no encontrado' });
    }
    res.json(consumo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/consumos/:id - actualizar el monto de un consumo existente
async function actualizarConsumo(req, res) {
  try {
    const { monto } = req.body;

    if (monto === undefined || monto === null) {
      return res.status(400).json({ error: 'Debe enviar el campo monto' });
    }
    if (monto < 0) {
      return res.status(400).json({ error: 'El monto no puede ser negativo' });
    }

    const consumo = await ConsumoInsumo.findByIdAndUpdate(
      req.params.id,
      { $set: { monto } },
      { new: true, runValidators: true }
    );

    if (!consumo) {
      return res.status(404).json({ error: 'Consumo no encontrado' });
    }
    res.json(consumo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/consumos/:id - eliminar un consumo
async function eliminarConsumo(req, res) {
  try {
    const consumo = await ConsumoInsumo.findByIdAndDelete(req.params.id);

    if (!consumo) {
      return res.status(404).json({ error: 'Consumo no encontrado' });
    }
    res.json({
      mensaje: 'Consumo eliminado',
      eliminado: consumo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearConsumo,
  listarConsumos,
  obtenerConsumo,
  actualizarConsumo,
  eliminarConsumo
};