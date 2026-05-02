// seed.js
// Script de peuplement de la base de données avec des données de test

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Patient = require('./models/Patient');
const RendezVous = require('./models/RendezVous');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connecté à MongoDB pour le seed');
};

const patients = [
  {
    nom: 'Benali',
    prenom: 'Ahmed',
    dateNaissance: new Date('1985-03-15'),
    sexe: 'Homme',
    telephone: '+216 22 345 678',
    email: 'ahmed.benali@email.com',
    adresse: '12 Rue de la Liberté, Tunis',
    groupeSanguin: 'A+',
    allergies: 'Pénicilline',
    antecedents: 'Hypertension artérielle',
  },
  {
    nom: 'Trabelsi',
    prenom: 'Fatma',
    dateNaissance: new Date('1990-07-22'),
    sexe: 'Femme',
    telephone: '+216 55 678 901',
    email: 'fatma.trabelsi@email.com',
    adresse: '45 Avenue Habib Bourguiba, Sfax',
    groupeSanguin: 'O+',
    allergies: '',
    antecedents: 'Diabète type 2',
  },
  {
    nom: 'Mansour',
    prenom: 'Khalil',
    dateNaissance: new Date('1978-11-08'),
    sexe: 'Homme',
    telephone: '+216 98 123 456',
    email: 'khalil.mansour@email.com',
    adresse: '8 Rue Ibn Khaldoun, Sousse',
    groupeSanguin: 'B+',
    allergies: 'Aspirine, Ibuprofen',
    antecedents: 'Asthme, Rhinite allergique',
  },
  {
    nom: 'Gharbi',
    prenom: 'Sonia',
    dateNaissance: new Date('1995-01-30'),
    sexe: 'Femme',
    telephone: '+216 77 234 567',
    email: 'sonia.gharbi@email.com',
    adresse: '23 Rue des Roses, Monastir',
    groupeSanguin: 'AB-',
    allergies: '',
    antecedents: '',
  },
  {
    nom: 'Jebali',
    prenom: 'Mohamed',
    dateNaissance: new Date('1960-05-14'),
    sexe: 'Homme',
    telephone: '+216 20 987 654',
    email: 'mohamed.jebali@email.com',
    adresse: '67 Boulevard du 7 Novembre, Nabeul',
    groupeSanguin: 'O-',
    allergies: 'Latex',
    antecedents: 'Insuffisance cardiaque, Diabète type 1',
  },
];

const users = [
  {
    nom: 'Admin',
    prenom: 'Système',
    email: 'admin@clinique.tn',
    motDePasse: 'Admin123!',
    role: 'admin',
  },
  {
    nom: 'Ben Salah',
    prenom: 'Dr. Karim',
    email: 'medecin@clinique.tn',
    motDePasse: 'Medecin123!',
    role: 'medecin',
  },
  {
    nom: 'Saidi',
    prenom: 'Nadia',
    email: 'secretaire@clinique.tn',
    motDePasse: 'Secretaire123!',
    role: 'secretaire',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Nettoyage des données existantes
    console.log('🗑️  Suppression des données existantes...');
    await Patient.deleteMany({});
    await RendezVous.deleteMany({});
    await User.deleteMany({});

    // Création des utilisateurs
    console.log('👤 Création des utilisateurs...');
    await User.create(users);

    // Création des patients
    console.log('🏥 Création des patients...');
    const patientsCreés = await Patient.create(patients);

    // Création des rendez-vous
    console.log('📅 Création des rendez-vous...');
    const maintenant = new Date();

    const rendezVous = [
      {
        patient: patientsCreés[0]._id,
        dateHeure: new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 1, 9, 0),
        duree: 30,
        motif: 'Consultation générale - suivi hypertension',
        statut: 'confirmé',
        medecin: 'Dr. Ben Salah',
      },
      {
        patient: patientsCreés[1]._id,
        dateHeure: new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 1, 10, 30),
        duree: 45,
        motif: 'Contrôle glycémie - diabète',
        statut: 'planifié',
        medecin: 'Dr. Ben Salah',
      },
      {
        patient: patientsCreés[2]._id,
        dateHeure: new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 2, 14, 0),
        duree: 30,
        motif: 'Crise d\'asthme - bilan respiratoire',
        statut: 'planifié',
        medecin: 'Dr. Ben Salah',
      },
      {
        patient: patientsCreés[0]._id,
        dateHeure: new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - 7, 9, 0),
        duree: 30,
        motif: 'Consultation de routine',
        statut: 'terminé',
        medecin: 'Dr. Ben Salah',
        diagnostic: 'Tension artérielle stable',
        traitement: 'Maintien du traitement actuel',
        notes: 'Patient en bonne forme',
      },
      {
        patient: patientsCreés[3]._id,
        dateHeure: new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 3, 11, 0),
        duree: 20,
        motif: 'Renouvellement ordonnance',
        statut: 'planifié',
        medecin: 'Dr. Ben Salah',
      },
    ];

    await RendezVous.create(rendezVous);

    console.log('\n✅ Base de données peuplée avec succès !');
    console.log('─'.repeat(50));
    console.log('👥 Comptes de test :');
    console.log('  Admin      → admin@clinique.tn / Admin123!');
    console.log('  Médecin    → medecin@clinique.tn / Medecin123!');
    console.log('  Secrétaire → secretaire@clinique.tn / Secretaire123!');
    console.log('─'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
    process.exit(1);
  }
};

seedDatabase();