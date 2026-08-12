require('dotenv').config();
const mongoose = require('mongoose');
const CentroProduccion = require('../models/CentroProduccion');
const centros = require('./data/centros_produccion.json');

async function seedCentros() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await CentroProduccion.deleteMany({});
    console.log('🗑️  Centros anteriores eliminados');

    const resultado = await CentroProduccion.insertMany(centros);
    console.log(`✅ ${resultado.length} centros insertados correctamente`);

    // Resumen por tipo
    const finales = resultado.filter(c => c.tipo === 'final').length;
    const intermedios = resultado.filter(c => c.tipo === 'intermedio').length;
    console.log(`   📊 ${finales} finales, ${intermedios} intermedios`);

  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

seedCentros();