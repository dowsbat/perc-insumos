    const ConsumoInsumo = require('../models/ConsumoInsumo');
const Departamento = require('../models/Departamento');
const CentroProduccion = require('../models/CentroProduccion');

// GET /api/reportes/avance?periodo=YYYY-MM
// Lista los 42 departamentos marcando si tienen datos capturados (monto > 0) en el período
async function avanceDepartamentos(req, res) {
  try {
    const { periodo } = req.query;
    if (!periodo) return res.status(400).json({ mensaje: 'Falta el período (?periodo=YYYY-MM)' });

    const conDatos = await ConsumoInsumo.aggregate([
      { $match: { periodo, monto: { $gt: 0 } } },
      { $group: { _id: '$departamento' } }
    ]);
    const ids = new Set(conDatos.map(d => String(d._id)));

    const departamentos = await Departamento.find()
      .populate('division', 'codigo nombre')
      .sort({ codigo: 1 });

    const resultado = departamentos.map(d => ({
      _id: d._id,
      codigo: d.codigo,
      nombre: d.nombre,
      division: d.division,
      tieneDatos: ids.has(String(d._id))
    }));

    res.json({
      periodo,
      total: resultado.length,
      conDatos: resultado.filter(r => r.tieneDatos).length,
      departamentos: resultado
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

// GET /api/reportes/avance/:departamentoId?periodo=YYYY-MM
// Detalle: centros del departamento marcando cuáles tienen datos y cuáles no
async function avanceCentros(req, res) {
  try {
    const { periodo } = req.query;
    if (!periodo) return res.status(400).json({ mensaje: 'Falta el período (?periodo=YYYY-MM)' });

    const depto = await Departamento.findById(req.params.departamentoId)
      .populate('division', 'codigo nombre')
      .populate('centros', 'codigo nombre orden');
    if (!depto) return res.status(404).json({ mensaje: 'Departamento no encontrado' });

    // Si tiene centros asignados, solo esos; si no, todos
    let centros;
    if (depto.centros && depto.centros.length) {
      centros = [...depto.centros];
    } else {
      centros = await CentroProduccion.find().select('codigo nombre orden').sort({ orden: 1 });
    }

    // Sumar montos por centro para este depto + período
    const agg = await ConsumoInsumo.aggregate([
      { $match: { departamento: depto._id, periodo, monto: { $gt: 0 } } },
      { $group: { _id: '$centro', total: { $sum: '$monto' }, celdas: { $sum: 1 } } }
    ]);
    const porCentro = new Map(agg.map(a => [String(a._id), a]));

    const filas = centros
      .map(c => {
        const info = porCentro.get(String(c._id));
        return {
          _id: c._id,
          codigo: c.codigo,
          nombre: c.nombre,
          orden: c.orden ?? 999,
          tieneDatos: !!info,
          total: info?.total || 0,
          celdas: info?.celdas || 0
        };
      })
      .sort((a, b) => a.orden - b.orden);

    res.json({
      periodo,
      departamento: { _id: depto._id, codigo: depto.codigo, nombre: depto.nombre, division: depto.division },
      totalCentros: filas.length,
      conDatos: filas.filter(f => f.tieneDatos).length,
      centros: filas
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { avanceDepartamentos, avanceCentros };