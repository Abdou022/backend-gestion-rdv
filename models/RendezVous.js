// models/RendezVous.js
// Modèle Mongoose pour les rendez-vous médicaux

const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient', // Référence au modèle Patient
      required: [true, 'Le patient est obligatoire'],
    },
    dateHeure: {
      type: Date,
      required: [true, 'La date et heure du rendez-vous sont obligatoires'],
    },
    duree: {
      type: Number, // Durée en minutes
      default: 30,
      min: [5, 'La durée minimale est de 5 minutes'],
      max: [240, 'La durée maximale est de 240 minutes'],
    },
    motif: {
      type: String,
      required: [true, 'Le motif du rendez-vous est obligatoire'],
      trim: true,
      maxlength: [500, 'Le motif ne peut pas dépasser 500 caractères'],
    },
    statut: {
      type: String,
      enum: ['planifié', 'confirmé', 'en_cours', 'terminé', 'annulé', 'absent'],
      default: 'planifié',
    },
    medecin: {
      type: String,
      trim: true,
      default: 'Dr. Généraliste',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    diagnostic: {
      type: String,
      trim: true,
      default: '',
    },
    traitement: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Validation : la date ne peut pas être dans le passé (pour les nouveaux RDV)
rendezVousSchema.pre('save', function () {
  if (this.isNew && this.dateHeure < new Date()) {
    console.warn('⚠️ Attention : rendez-vous créé avec une date passée');
  }
});

// Index pour les recherches fréquentes
rendezVousSchema.index({ patient: 1, dateHeure: 1 });
rendezVousSchema.index({ dateHeure: 1, statut: 1 });

module.exports = mongoose.model('RendezVous', rendezVousSchema);