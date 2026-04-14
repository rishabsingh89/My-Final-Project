const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Storage for product images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/images';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${uuidv4()}${ext}`);
  },
});

// Storage for CSV imports
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/csv';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `import-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filter: images only
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed'), false);
  }
};

// Filter: CSV only
const csvFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed for import'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

const uploadCSV = multer({
  storage: csvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: csvFilter,
});

module.exports = { uploadImage, uploadCSV };
