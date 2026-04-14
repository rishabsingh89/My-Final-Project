const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem,
  getStockHistory,
  getProductPrediction,
  getAllPredictions,
  getDashboardStats,
  importFromCSV,
  getCategories,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage, uploadCSV } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Special routes (before /:id to avoid conflicts)
router.get('/dashboard/stats', getDashboardStats);
router.get('/predictions/all', getAllPredictions);
router.get('/meta/categories', getCategories);
router.post('/import/csv', authorize('admin', 'manager'), uploadCSV.single('file'), importFromCSV);

// Core CRUD
router.get('/', getInventory);
router.post('/', authorize('admin', 'manager'), uploadImage.single('image'), createInventoryItem);

router.get('/:id', getInventoryItem);
router.put('/:id', authorize('admin', 'manager'), uploadImage.single('image'), updateInventoryItem);
router.delete('/:id', authorize('admin'), deleteInventoryItem);

// Stock operations
router.patch('/:id/stock', authorize('admin', 'manager'), updateStock);

// History & predictions per product
router.get('/:id/history', getStockHistory);
router.get('/:id/predict', getProductPrediction);

module.exports = router;
