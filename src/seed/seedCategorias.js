require('dotenv').config();
const mongoose = require('mongoose');
const CategoriaInsumo = require('../models/CategoriaInsumo');
const categorias = require('./data/categorias_insumo.json');

async function seedCategorias() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await CategoriaInsumo.deleteMany({});
    console.log('🗑️  Categorías anteriores eliminadas');

    const resultado = await CategoriaInsumo.insertMany(categorias);
    console.log(`✅ ${resultado.length} categorías insertadas correctamente`);

  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

seedCategorias();