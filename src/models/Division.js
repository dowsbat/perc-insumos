const mongoose = require('mongoose');

// Esquema: define la "forma" de una División
const divisionSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,   // obligatorio
    unique: true,     // no se puede repetir
    uppercase: true,  // siempre en mayúsculas (DIR, ENF...)
    trim: true        // quita espacios sobrantes
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true  // agrega automáticamente createdAt y updatedAt
});

// Modelo: la herramienta para crear/leer/editar divisiones en la BD
const Division = mongoose.model('Division', divisionSchema);

module.exports = Division;