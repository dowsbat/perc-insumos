const mongoose = require('mongoose');

// Sub-esquema para las subdivisiones (van anidadas dentro del centro)
const subdivisionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true });  // cada subdivisión igual recibe su _id automático

const centroProduccionSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['final', 'intermedio'],
    default: 'final'
  },
  orden: {
    type: Number,
    default: 999
  },
  // Lista de subdivisiones anidadas (vacía si el centro no tiene desglose)
  subdivisiones: [subdivisionSchema]
}, {
  timestamps: true
});

const CentroProduccion = mongoose.model('CentroProduccion', centroProduccionSchema);

module.exports = CentroProduccion;