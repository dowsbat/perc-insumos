const mongoose = require('mongoose');

const categoriaInsumoSchema = new mongoose.Schema({
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
  // Área/unidad encargada de llenar esta categoría (ej: TRANSPORTE, ALMACEN)
  areaEncargada: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

const CategoriaInsumo = mongoose.model('CategoriaInsumo', categoriaInsumoSchema);

module.exports = CategoriaInsumo;