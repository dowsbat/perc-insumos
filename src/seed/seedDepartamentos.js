require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Departamento = require('../models/Departamento');
const Division = require('../models/Division');
const CategoriaInsumo = require('../models/CategoriaInsumo');

const datos = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'departamentos.json'), 'utf-8')
);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const divisiones = await Division.find();
  const categorias = await CategoriaInsumo.find();

  const divPorCodigo = new Map(divisiones.map(d => [d.codigo.toUpperCase(), d._id]));
  const catPorCodigo = new Map(categorias.map(c => [String(c.codigo).trim(), c._id]));

  await Departamento.deleteMany({});
  console.log('🗑  Departamentos anteriores eliminados');

  const faltantes = new Set();
  const docs = [];

  for (const d of datos) {
    const divId = divPorCodigo.get(d.divisionCodigo);
    if (!divId) { console.log(`⚠️  División no encontrada: ${d.divisionCodigo}`); continue; }

    const cats = [];
    for (const c of d.categorias) {
      const id = catPorCodigo.get(c);
      if (id) cats.push(id); else faltantes.add(c);
    }

    docs.push({ codigo: d.codigo, nombre: d.nombre, division: divId, categorias: cats });
  }

  await Departamento.insertMany(docs);
  console.log(`✅ ${docs.length} departamentos insertados`);
  if (faltantes.size) console.log(`⚠️  Códigos de categoría no encontrados: ${[...faltantes].join(', ')}`);

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });