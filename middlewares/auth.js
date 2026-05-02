// middleware/auth.js
// Middleware d'authentification JWT

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Vérifie le token JWT et attache l'utilisateur à la requête
 */
const protect = async (req, res, next) => {
  let token;

  // Vérification de la présence du token dans le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Token manquant.',
    });
  }

  try {
    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.actif) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable ou désactivé.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.',
    });
  }
};

/**
 * Restreint l'accès à certains rôles
 * @param  {...string} roles - Rôles autorisés
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle "${req.user.role}" n'est pas autorisé à effectuer cette action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };