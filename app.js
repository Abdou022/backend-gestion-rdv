// app.js
// Point d'entrée de l'application Express

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');

// Connexion à MongoDB
connectDB();

const app = express();

// ─── Middlewares globaux ───────────────────────────────────────────────────────

// CORS : autorise les requêtes depuis le frontend Angular
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers uploadés (photos patients)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes API ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/rendezvous', rendezVousRoutes);

// Route de santé (health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ API Gestion RDV Médicaux opérationnelle',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Route 404 pour les endpoints inexistants
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} introuvable`,
  });
});

// ─── Middleware de gestion des erreurs (doit être le dernier) ─────────────────
app.use(errorHandler);

// ─── Démarrage du serveur ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📋 Environnement : ${process.env.NODE_ENV}`);
  console.log(`📡 API disponible sur : http://localhost:${PORT}/api\n`);
});

module.exports = app;