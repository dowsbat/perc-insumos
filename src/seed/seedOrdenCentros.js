require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const CentroProduccion = require('../models/CentroProduccion');

const orden = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'centros_orden.json'), 'utf-8')
);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const centros = await CentroProduccion.find();
  const porCodigo = new Map(centros.map(c => [String(c.codigo).trim(), c]));

  let ok = 0;
  const sinMatch = [];

  for (let i = 0; i < orden.length; i++) {
    const c = porCodigo.get(String(orden[i].codigo));
    if (!c) { sinMatch.push(`${orden[i].codigo} — ${orden[i].nombre}`); continue; }
    c.orden = i + 1;
    await c.save();
    porCodigo.delete(String(orden[i].codigo));
    ok++;
  }

  console.log(`✅ Centros ordenados: ${ok} de ${orden.length}`);
  if (sinMatch.length) {
    console.log(`\n⚠️  En el Excel pero NO en la BD (${sinMatch.length}):`);
    sinMatch.forEach(n => console.log('   - ' + n));
  }
  if (porCodigo.size) {
    console.log(`\n⚠️  En la BD pero NO en el Excel (${porCodigo.size}):`);
    [...porCodigo.values()].forEach(c => console.log(`   - ${c.codigo} — ${c.nombre}`));
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });