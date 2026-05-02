// routes/rendezVousRoutes.js
// Définition des routes API pour les rendez-vous

const express = require('express');
const router = express.Router();
const {
  getAllRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getStats,
} = require('../controllers/rendezVousController');
const { protect, authorize } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route statistiques (avant /:id pour éviter le conflit)
router.get('/stats', getStats); // GET /api/rendezvous/stats

// Routes CRUD
router
  .route('/')
  .get(getAllRendezVous)       // GET  /api/rendezvous
  .post(createRendezVous);    // POST /api/rendezvous

router
  .route('/:id')
  .get(getRendezVousById)     // GET    /api/rendezvous/:id
  .put(updateRendezVous)      // PUT    /api/rendezvous/:id
  .delete(deleteRendezVous);  // DELETE /api/rendezvous/:id

module.exports = router;