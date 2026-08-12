require('dotenv').config();
const mongoose = require('mongoose');
const Departamento = require('../models/Departamento');
require('../models/Division'); // hay que registrar el modelo para que populate funcione

async function probar() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado\n');

    // SIN populate: la division es solo un ObjectId
    console.log('=== SIN populate ===');
    const sinPopulate = await Departamento.findOne({ codigo: 'APD-03' });
    console.log(sinPopulate);

    console.log('\n=== CON populate ===');
    // CON populate: trae los datos completos de la division
    const conPopulate = await Departamento.findOne({ codigo: 'APD-03' })
      .populate('division');
    console.log(conPopulate);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

probar();