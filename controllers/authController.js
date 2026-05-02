// controllers/authController.js
// Logique d'authentification (inscription / connexion)

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Génère un token JWT signé
 * @param {string} id - ID de l'utilisateur
 */
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Connexion utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    // Récupérer l'utilisateur avec le mot de passe (select: false par défaut)
    const user = await User.findOne({ email }).select('+motDePasse');

    if (!user || !(await user.comparePassword(motDePasse))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    if (!user.actif) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.',
      });
    }

    const token = genererToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public (ou Admin seulement en production)
 */
const register = async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    const user = await User.create({ nom, prenom, email, motDePasse, role });
    const token = genererToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Protégé
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = { login, register, getMe };