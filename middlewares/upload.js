// middleware/upload.js
// Configuration Multer pour l'upload de photos patients

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Création du dossier uploads si inexistant
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nom unique : timestamp + nom original nettoyé
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `patient-${uniqueSuffix}${extension}`);
  },
});

// Filtre : accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isExtensionValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtensionValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, PNG, GIF, WebP) sont acceptées.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
});

module.exports = upload;