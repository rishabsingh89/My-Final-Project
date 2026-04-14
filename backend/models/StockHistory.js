const mongoose = require('mongoose');

const StockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    type: {
      type: String,
      enum: ['restock', 'sale', 'adjustment', 'return', 'damage', 'import'],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true, // positive = stock in, negative = stock out
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    referenceId: {
      type: String,
      default: null, // Order ID, PO number, etc.
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockHistory', StockHistorySchema);
