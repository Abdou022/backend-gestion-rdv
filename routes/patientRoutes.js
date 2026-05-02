// routes/patientRoutes.js
// Définition des routes API pour les patients

const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Toutes les routes patients nécessitent une authentification
router.use(protect);

// Routes CRUD
router
  .route('/')
  .get(getAllPatients)                    // GET  /api/patients
  .post(upload.single('photo'), createPatient); // POST /api/patients

router
  .route('/:id')
  .get(getPatientById)                   // GET    /api/patients/:id
  .put(upload.single('photo'), updatePatient)  // PUT    /api/patients/:id
  .delete(authorize('medecin', 'admin'), deletePatient); // DELETE /api/patients/:id

module.exports = router;