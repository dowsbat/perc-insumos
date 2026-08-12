require('dotenv').config();

const cors = require('cors');
const express = require('express');
const conectarDB = require('./config/database');
const divisionRoutes = require('./routes/divisionRoutes'); // ← NUEVO
const departamentoRoutes = require('./routes/departamentoRoutes');   // ← NUEVO
const centroRoutes = require('./routes/centroRoutes');               // ← NUEVO
const categoriaRoutes = require('./routes/categoriaRoutes');         // ← NUEVO
const consumoRoutes = require('./routes/consumoRoutes');

const app = express();
app.use(cors());

conectarDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API PERC Insumos funcionando 🔥',
    fecha: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/divisiones', divisionRoutes); // ← NUEVO
app.use('/api/departamentos', departamentoRoutes);   // ← NUEVO
app.use('/api/centros', centroRoutes);               // ← NUEVO
app.use('/api/categorias', categoriaRoutes);         // ← NUEVO
app.use('/api/consumos', consumoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});