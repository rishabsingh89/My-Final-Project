const Inventory = require('../models/Inventory');
const StockHistory = require('../models/StockHistory');
const { generatePrediction, getTrendData } = require('../utils/prediction');
const csv = require('csv-parser');
const fs = require('fs');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = { $regex: category, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const allItems = await Inventory.find(query).populate('createdBy', 'name email');
    
    // Filter by virtual stockStatus
    let filtered = allItems;
    if (stockStatus) {
      filtered = allItems.filter((item) => item.stockStatus === stockStatus);
    }

    // Sort
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (sortBy === 'quantity') return (a.quantity - b.quantity) * sortDir;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * sortDir;
      return (new Date(a.createdAt) - new Date(b.createdAt)) * sortDir;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      total: filtered.length,
      page: parseInt(page),
      pages: Math.ceil(filtered.length / limit),
      inventory: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('createdBy', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Manager+
const createInventoryItem = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    if (req.file) {
      req.body.image = `/uploads/images/${req.file.filename}`;
    }

    const item = await Inventory.create(req.body);

    // Log initial stock entry
    if (item.quantity > 0) {
      await StockHistory.create({
        product: item._id,
        type: 'restock',
        quantityChange: item.quantity,
        quantityBefore: 0,
        quantityAfter: item.quantity,
        note: 'Initial stock entry',
        performedBy: req.user.id,
      });
    }

    res.status(201).json({ success: true, message: 'Product created successfully', item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Manager+
const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.file) {
      req.body.image = `/uploads/images/${req.file.filename}`;
    }

    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Product updated successfully', item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update stock quantity (sale, restock, adjustment)
// @route   PATCH /api/inventory/:id/stock
// @access  Private/Manager+
const updateStock = async (req, res) => {
  try {
    const { type, quantityChange, note, referenceId } = req.body;

    if (!type || quantityChange === undefined) {
      return res.status(400).json({ success: false, message: 'type and quantityChange are required' });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

    const quantityBefore = item.quantity;
    const newQuantity = item.quantity + parseInt(quantityChange);

    if (newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Cannot reduce stock below 0' });
    }

    item.quantity = newQuantity;
    await item.save();

    // Log history
    await StockHistory.create({
      product: item._id,
      type,
      quantityChange: parseInt(quantityChange),
      quantityBefore,
      quantityAfter: newQuantity,
      note: note || '',
      performedBy: req.user.id,
      referenceId: referenceId || null,
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      item,
      change: { type, quantityBefore, quantityAfter: newQuantity, quantityChange: parseInt(quantityChange) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inventory item (soft delete)
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock history for a product
// @route   GET /api/inventory/:id/history
// @access  Private
const getStockHistory = async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    const query = { product: req.params.id };
    if (type) query.type = type;

    const history = await StockHistory.find(query)
      .populate('performedBy', 'name email')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get prediction for a single product
// @route   GET /api/inventory/:id/predict
// @access  Private
const getProductPrediction = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

    const history = await StockHistory.find({ product: req.params.id }).sort('createdAt');
    const prediction = generatePrediction(item, history);
    const trend = getTrendData(history);

    res.status(200).json({ success: true, prediction, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get predictions for all products (critical/low stock)
// @route   GET /api/inventory/predictions/all
// @access  Private
const getAllPredictions = async (req, res) => {
  try {
    const items = await Inventory.find({ isActive: true });

    const predictions = await Promise.all(
      items.map(async (item) => {
        const history = await StockHistory.find({ product: item._id });
        return generatePrediction(item, history);
      })
    );

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    predictions.sort((a, b) => urgencyOrder[a.reorderUrgency] - urgencyOrder[b.reorderUrgency]);

    const critical = predictions.filter((p) => p.reorderUrgency === 'critical');
    const high = predictions.filter((p) => p.reorderUrgency === 'high');
    const needsReorder = predictions.filter((p) => ['critical', 'high', 'medium'].includes(p.reorderUrgency));

    res.status(200).json({
      success: true,
      summary: {
        total: predictions.length,
        criticalCount: critical.length,
        highCount: high.length,
        needsReorderCount: needsReorder.length,
      },
      predictions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dashboard stats
// @route   GET /api/inventory/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const allItems = await Inventory.find({ isActive: true });

    const stats = {
      totalProducts: allItems.length,
      totalStockValue: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      categories: {},
    };

    allItems.forEach((item) => {
      stats.totalStockValue += item.quantity * item.costPrice;
      const status = item.stockStatus;
      if (status === 'in_stock') stats.inStock++;
      else if (status === 'low_stock') stats.lowStock++;
      else if (status === 'out_of_stock') stats.outOfStock++;

      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    });

    // Recent activity (last 10 stock movements)
    const recentActivity = await StockHistory.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort('-createdAt')
      .limit(10);

    // Monthly consumption trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await StockHistory.aggregate([
      {
        $match: {
          type: 'sale',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalConsumed: { $sum: { $abs: '$quantityChange' } },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        totalStockValue: parseFloat(stats.totalStockValue.toFixed(2)),
      },
      recentActivity,
      monthlyTrend: monthlyData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import inventory from CSV
// @route   POST /api/inventory/import/csv
// @access  Private/Manager+
const importFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const results = [];
    const errors = [];

    const stream = fs.createReadStream(req.file.path).pipe(csv());

    for await (const row of stream) {
      try {
        const item = {
          name: row.name || row.Name,
          sku: (row.sku || row.SKU || '').toUpperCase(),
          category: row.category || row.Category,
          quantity: parseInt(row.quantity || row.Quantity) || 0,
          unit: row.unit || row.Unit || 'units',
          costPrice: parseFloat(row.costPrice || row.cost_price || row['Cost Price']) || 0,
          sellingPrice: parseFloat(row.sellingPrice || row.selling_price || row['Selling Price']) || 0,
          reorderPoint: parseInt(row.reorderPoint || row.reorder_point || row['Reorder Point']) || 10,
          reorderQuantity: parseInt(row.reorderQuantity || row.reorder_qty || row['Reorder Qty']) || 50,
          description: row.description || row.Description || '',
          createdBy: req.user.id,
        };

        if (!item.name || !item.sku || !item.category) {
          errors.push({ row, error: 'Missing required fields: name, sku, category' });
          continue;
        }

        const existing = await Inventory.findOne({ sku: item.sku });
        if (existing) {
          // Update quantity only
          const before = existing.quantity;
          existing.quantity += item.quantity;
          await existing.save();
          if (item.quantity > 0) {
            await StockHistory.create({
              product: existing._id,
              type: 'import',
              quantityChange: item.quantity,
              quantityBefore: before,
              quantityAfter: existing.quantity,
              note: 'CSV Import',
              performedBy: req.user.id,
            });
          }
          results.push({ sku: item.sku, action: 'updated' });
        } else {
          const created = await Inventory.create(item);
          if (item.quantity > 0) {
            await StockHistory.create({
              product: created._id,
              type: 'import',
              quantityChange: item.quantity,
              quantityBefore: 0,
              quantityAfter: item.quantity,
              note: 'CSV Import',
              performedBy: req.user.id,
            });
          }
          results.push({ sku: item.sku, action: 'created' });
        }
      } catch (rowError) {
        errors.push({ row, error: rowError.message });
      }
    }

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `Import complete: ${results.filter((r) => r.action === 'created').length} created, ${results.filter((r) => r.action === 'updated').length} updated`,
      imported: results,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/inventory/meta/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Inventory.distinct('category', { isActive: true });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
