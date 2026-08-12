// Corre todos los seeds en el orden correcto
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const pasos = [
  'seedDivisiones.js',
  'seedCentros.js',
  'seedCategorias.js',
  'seedDepartamentos.js',
  'seedOrdenCentros.js'
];

for (const paso of pasos) {
  console.log(`\n▶️  Ejecutando ${paso}...`);
  execSync(`node ${path.join(__dirname, paso)}`, { stdio: 'inherit' });
}

console.log('\n✅ Todos los seeds completados');