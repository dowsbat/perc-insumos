require('dotenv').config();
const mongoose = require('mongoose');
const Division = require('../models/Division');
const divisiones = require('./data/divisiones.json');

async function seedDivisiones() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Borrar divisiones existentes (para no duplicar si corremos el seed varias veces)
    await Division.deleteMany({});
    console.log('🗑️  Divisiones anteriores eliminadas');

    // Insertar las nuevas divisiones
    const resultado = await Division.insertMany(divisiones);
    console.log(`✅ ${resultado.length} divisiones insertadas correctamente`);

    // Mostrarlas en consola
    resultado.forEach(d => console.log(`   - ${d.codigo}: ${d.nombre}`));

  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
  } finally {
    // Cerrar la conexión al terminar
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

seedDivisiones();
