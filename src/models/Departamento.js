const mongoose = require('mongoose');

const departamentoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  // La referencia a la División (como una foreign key)
  division: {
    type: mongoose.Schema.Types.ObjectId,  // guarda un _id
    ref: 'Division',                         // apunta al modelo Division
    required: true
  },
  categorias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaInsumo'
  }],
  centros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CentroProduccion'
  }]
}, {
  timestamps: true
});

const Departamento = mongoose.model('Departamento', departamentoSchema);

module.exports = Departamento;