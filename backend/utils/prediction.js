/**
 * Predictive Inventory Engine
 * Uses weighted moving average & consumption trends to predict:
 * - Days until stockout
 * - Recommended reorder date
 * - Forecasted demand for next 30/60/90 days
 */

/**
 * Calculate average daily consumption from stock history
 * Uses weighted average (recent entries weighted more heavily)
 */
const calculateDailyConsumption = (history) => {
  const salesHistory = history
    .filter((h) => h.type === 'sale' && h.quantityChange < 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (salesHistory.length === 0) return 0;

  // Group by day
  const dailyMap = {};
  salesHistory.forEach((entry) => {
    const day = new Date(entry.createdAt).toISOString().split('T')[0];
    dailyMap[day] = (dailyMap[day] || 0) + Math.abs(entry.quantityChange);
  });

  const days = Object.keys(dailyMap).sort();
  if (days.length === 0) return 0;

  // Weighted moving average (recent = more weight)
  const values = days.map((d) => dailyMap[d]);
  let weightedSum = 0;
  let weightTotal = 0;
  values.forEach((val, i) => {
    const weight = i + 1; // more recent = higher index = higher weight
    weightedSum += val * weight;
    weightTotal += weight;
  });

  return weightTotal > 0 ? weightedSum / weightTotal : 0;
};

/**
 * Predict days until stockout
 */
const predictStockout = (currentQuantity, dailyConsumption) => {
  if (dailyConsumption <= 0) return null; // No consumption data
  return Math.floor(currentQuantity / dailyConsumption);
};

/**
 * Generate full prediction report for a single product
 */
const generatePrediction = (product, history) => {
  const dailyConsumption = calculateDailyConsumption(history);
  const daysUntilStockout = predictStockout(product.quantity, dailyConsumption);
  const leadTime = product.supplier?.leadTimeDays || 7;

  // Recommended reorder date = stockout date - lead time
  let reorderDate = null;
  let reorderUrgency = 'none';

  if (daysUntilStockout !== null) {
    const stockoutDate = new Date();
    stockoutDate.setDate(stockoutDate.getDate() + daysUntilStockout);

    const reorderDay = new Date();
    reorderDay.setDate(reorderDay.getDate() + (daysUntilStockout - leadTime));
    reorderDate = reorderDay;

    if (daysUntilStockout <= leadTime) {
      reorderUrgency = 'critical'; // Order NOW — stockout before delivery
    } else if (daysUntilStockout <= leadTime * 2) {
      reorderUrgency = 'high';
    } else if (daysUntilStockout <= leadTime * 3) {
      reorderUrgency = 'medium';
    } else {
      reorderUrgency = 'low';
    }
  }

  // Demand forecast (next 30, 60, 90 days)
  const forecast = {
    next30Days: Math.ceil(dailyConsumption * 30),
    next60Days: Math.ceil(dailyConsumption * 60),
    next90Days: Math.ceil(dailyConsumption * 90),
  };

  // Suggested reorder quantity (cover 90 days + safety buffer of 20%)
  const suggestedOrderQty = Math.ceil(forecast.next90Days * 1.2);

  return {
    productId: product._id,
    productName: product.name,
    sku: product.sku,
    currentStock: product.quantity,
    reorderPoint: product.reorderPoint,
    dailyConsumption: parseFloat(dailyConsumption.toFixed(2)),
    daysUntilStockout,
    reorderDate,
    reorderUrgency,
    suggestedOrderQty: Math.max(suggestedOrderQty, product.reorderQuantity),
    forecast,
    stockStatus: product.stockStatus,
    confidence: history.length >= 30 ? 'high' : history.length >= 7 ? 'medium' : 'low',
  };
};

/**
 * Get trend analysis for a product (weekly consumption over time)
 */
const getTrendData = (history, weeks = 8) => {
  const salesHistory = history
    .filter((h) => h.type === 'sale' && h.quantityChange < 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const trendData = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);

    const weekSales = salesHistory
      .filter((h) => {
        const d = new Date(h.createdAt);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, h) => sum + Math.abs(h.quantityChange), 0);

    trendData.push({
      week: `Week ${weeks - i}`,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      consumed: weekSales,
    });
  }

  return trendData;
};

module.exports = { generatePrediction, calculateDailyConsumption, getTrendData };
