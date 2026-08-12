const mongoose = require('mongoose');

const consumoInsumoSchema = new mongoose.Schema({
  // Quién reporta el gasto
  departamento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departamento',
    required: true
  },
  // A qué centro de producción va
  centro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CentroProduccion',
    required: true
  },
  // Subdivisión (opcional, como texto)
  subdivision: {
    type: String,
    trim: true,
    default: null
  },
  // Qué tipo de insumo
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaInsumo',
    required: true
  },
  // Período mensual, formato "AAAA-MM"
  periodo: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/,  // valida que sea tipo "2026-07"
    trim: true
  },
  // Monto en dólares
  monto: {
    type: Number,
    required: true,
    min: 0,        // no permite negativos
    default: 0
  }
}, {
  timestamps: true
});

// Índice único compuesto: impide duplicados de la misma celda
// La combinación de estos 5 campos debe ser única
consumoInsumoSchema.index(
  { departamento: 1, centro: 1, subdivision: 1, categoria: 1, periodo: 1 },
  { unique: true }
);

const ConsumoInsumo = mongoose.model('ConsumoInsumo', consumoInsumoSchema);

module.exports = ConsumoInsumo;