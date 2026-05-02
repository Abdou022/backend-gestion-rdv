// middleware/errorHandler.js
// Middleware centralisé de gestion des erreurs

/**
 * Middleware de gestion globale des erreurs Express
 * Doit être enregistré APRÈS toutes les routes
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Erreur ID MongoDB invalide (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Ressource introuvable (ID invalide)';
  }

  // Erreur de duplication (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `La valeur du champ "${field}" est déjà utilisée.`;
  }

  console.error(`❌ [${statusCode}] ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;