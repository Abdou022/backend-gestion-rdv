// models/Patient.js
// Modèle Mongoose pour les patients

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
      maxlength: [100, 'Le prénom ne peut pas dépasser 100 caractères'],
    },
    dateNaissance: {
      type: Date,
      required: [true, 'La date de naissance est obligatoire'],
    },
    sexe: {
      type: String,
      enum: ['Homme', 'Femme', 'Autre'],
      required: [true, 'Le sexe est obligatoire'],
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est obligatoire'],
      trim: true,
      match: [/^[0-9+\s\-()]{8,20}$/, 'Numéro de téléphone invalide'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    adresse: {
      type: String,
      trim: true,
    },
    groupeSanguin: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    allergies: {
      type: String,
      default: '',
    },
    antecedents: {
      type: String,
      default: '',
    },
    photo: {
      type: String, // Chemin vers le fichier uploadé
      default: '',
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour la recherche textuelle
patientSchema.index({ nom: 'text', prenom: 'text', email: 'text' });

// Méthode virtuelle : nom complet
patientSchema.virtual('nomComplet').get(function () {
  return `${this.prenom} ${this.nom}`;
});

module.exports = mongoose.model('Patient', patientSchema);