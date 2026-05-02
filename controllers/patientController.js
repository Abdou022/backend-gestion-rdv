// controllers/patientController.js
// Logique métier pour la gestion des patients

const Patient = require('../models/Patient');
const RendezVous = require('../models/RendezVous');

/**
 * @desc    Récupérer tous les patients (avec recherche et pagination)
 * @route   GET /api/patients
 * @access  Protégé
 */
const getAllPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, actif } = req.query;

    // Construction du filtre
    const filter = {};

    if (actif !== undefined) {
      filter.actif = actif === 'true';
    }

    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Patient.countDocuments(filter);

    const patients = await Patient.find(filter)
      .sort({ nom: 1, prenom: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupérer un patient par ID (avec ses rendez-vous)
 * @route   GET /api/patients/:id
 * @access  Protégé
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable',
      });
    }

    // Récupérer les rendez-vous liés à ce patient
    const rendezVous = await RendezVous.find({ patient: req.params.id })
      .sort({ dateHeure: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        rendezVous,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer un nouveau patient
 * @route   POST /api/patients
 * @access  Protégé
 */
const createPatient = async (req, res, next) => {
  try {
    const donneesPatient = { ...req.body };

    // Si une photo a été uploadée, on ajoute son chemin
    if (req.file) {
      donneesPatient.photo = `/uploads/${req.file.filename}`;
    }

    const patient = await Patient.create(donneesPatient);

    res.status(201).json({
      success: true,
      message: 'Patient créé avec succès',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Modifier un patient existant
 * @route   PUT /api/patients/:id
 * @access  Protégé
 */
const updatePatient = async (req, res, next) => {
  try {
    const donneesAModifier = { ...req.body };

    if (req.file) {
      donneesAModifier.photo = `/uploads/${req.file.filename}`;
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      donneesAModifier,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient modifié avec succès',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer un patient (et ses rendez-vous)
 * @route   DELETE /api/patients/:id
 * @access  Protégé (admin/médecin)
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable',
      });
    }

    // Supprimer les rendez-vous associés
    await RendezVous.deleteMany({ patient: req.params.id });

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Patient et ses rendez-vous supprimés avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};