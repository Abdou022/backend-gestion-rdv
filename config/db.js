// config/db.js
// Configuration et connexion à MongoDB via Mongoose

const mongoose = require('mongoose');

/**
 * Établit la connexion à la base de données MongoDB
 * Utilise l'URI défini dans les variables d'environnement
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;