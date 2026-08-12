const mongoose = require('mongoose');

// Función que conecta a MongoDB
async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    // Si no puede conectar, cerramos la app (no tiene sentido seguir sin BD)
    process.exit(1);
  }
}

module.exports = conectarDB;