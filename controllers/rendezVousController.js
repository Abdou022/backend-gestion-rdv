// controllers/rendezVousController.js
// Logique métier pour la gestion des rendez-vous

const RendezVous = require('../models/RendezVous');
const Patient = require('../models/Patient');

/**
 * @desc    Récupérer tous les rendez-vous (avec filtres)
 * @route   GET /api/rendezvous
 * @access  Protégé
 */
const getAllRendezVous = async (req, res, next) => {
  try {
    const { dateDebut, dateFin, statut, patient, page = 1, limit = 50 } = req.query;

    const filter = {};

    // Filtre par plage de dates
    if (dateDebut || dateFin) {
      filter.dateHeure = {};
      if (dateDebut) filter.dateHeure.$gte = new Date(dateDebut);
      if (dateFin) {
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999);
        filter.dateHeure.$lte = fin;
      }
    }

    if (statut) filter.statut = statut;
    if (patient) filter.patient = patient;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RendezVous.countDocuments(filter);

    const rendezVous = await RendezVous.find(filter)
      .populate('patient', 'nom prenom telephone email photo') // populate avec champs sélectionnés
      .sort({ dateHeure: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: rendezVous,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupérer un rendez-vous par ID
 * @route   GET /api/rendezvous/:id
 * @access  Protégé
 */
const getRendezVousById = async (req, res, next) => {
  try {
    const rendezVous = await RendezVous.findById(req.params.id)
      .populate('patient'); // Toutes les infos du patient

    if (!rendezVous) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable',
      });
    }

    res.status(200).json({
      success: true,
      data: rendezVous,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer un nouveau rendez-vous
 * @route   POST /api/rendezvous
 * @access  Protégé
 */
const createRendezVous = async (req, res, next) => {
  try {
    const { patient: patientId, dateHeure } = req.body;

    // Vérifier que le patient existe
    const patientExiste = await Patient.findById(patientId);
    if (!patientExiste) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable. Veuillez sélectionner un patient valide.',
      });
    }

    // Vérifier qu'il n'y a pas de conflit de créneau (même heure, même médecin)
    const conflit = await RendezVous.findOne({
      dateHeure: new Date(dateHeure),
      medecin: req.body.medecin || 'Dr. Généraliste',
      statut: { $nin: ['annulé', 'absent'] },
    });

    if (conflit) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau est déjà réservé pour ce médecin.',
      });
    }

    const rendezVous = await RendezVous.create(req.body);

    // Populate pour retourner les données complètes
    const rendezVousPopule = await RendezVous.findById(rendezVous._id)
      .populate('patient', 'nom prenom telephone email');

    res.status(201).json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      data: rendezVousPopule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Modifier un rendez-vous
 * @route   PUT /api/rendezvous/:id
 * @access  Protégé
 */
const updateRendezVous = async (req, res, next) => {
  try {
    const rendezVous = await RendezVous.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'nom prenom telephone email');

    if (!rendezVous) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rendez-vous modifié avec succès',
      data: rendezVous,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer un rendez-vous
 * @route   DELETE /api/rendezvous/:id
 * @access  Protégé
 */
const deleteRendezVous = async (req, res, next) => {
  try {
    const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);

    if (!rendezVous) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rendez-vous supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Statistiques du tableau de bord
 * @route   GET /api/rendezvous/stats
 * @access  Protégé
 */
const getStats = async (req, res, next) => {
  try {
    const aujourd_hui = new Date();
    aujourd_hui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourd_hui);
    demain.setDate(demain.getDate() + 1);

    const [
      totalPatients,
      rdvAujourdhui,
      rdvCeMois,
      rdvParStatut,
    ] = await Promise.all([
      Patient.countDocuments({ actif: true }),
      RendezVous.countDocuments({
        dateHeure: { $gte: aujourd_hui, $lt: demain },
        statut: { $nin: ['annulé'] },
      }),
      RendezVous.countDocuments({
        dateHeure: {
          $gte: new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth(), 1),
          $lt: new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth() + 1, 1),
        },
      }),
      RendezVous.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        rdvAujourdhui,
        rdvCeMois,
        rdvParStatut,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getStats,
};